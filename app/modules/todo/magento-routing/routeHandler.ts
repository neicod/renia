// @env: server
import type { Request } from 'express';
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { createCategoryRepository } from 'renia-magento-category/services/categoryRepository';
import { fetchProduct } from 'renia-magento-product/services/product';
import { fetchCmsPage } from 'renia-magento-cms/services/cmsPage';
import type { StoreConfig } from 'renia-magento-store';
import { prefetchProductListing } from 'renia-magento-product-listing/services/productListingPrefetch';
import { DEFAULT_PAGE_SIZE, extractCatalogStorefrontConfig } from 'renia-magento-product-listing/services/storefrontConfig';
import { getGlobalTtlCache } from '@renia/framework/server/cache/ttlCache';

type UrlResolverType = 'CATEGORY' | 'PRODUCT' | 'CMS_PAGE' | 'UNKNOWN';

type UrlResolverResult = {
  type?: UrlResolverType | string | null;
  relative_url?: string | null;
  redirect_code?: number | null;
  redirectCode?: number | null;
};

const normalizePath = (path: string): string => {
  const trimmed = (path ?? '').trim();
  if (!trimmed || trimmed === '/') return '';
  return trimmed.replace(/^\/+|\/+$/g, '');
};

const uniq = <T>(arr: T[]): T[] => Array.from(new Set(arr));

const CACHE_TTL_MS = (() => {
  const raw = process.env.RENIA_MAGENTO_ROUTING_CACHE_TTL_MS;
  if (raw === undefined) return 30_000;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 30_000;
})();

const CACHE_MAX_ENTRIES = (() => {
  const raw = process.env.RENIA_MAGENTO_ROUTING_CACHE_MAX_ENTRIES;
  if (raw === undefined) return 2000;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 2000;
})();

const getStoreCacheKey = (store?: StoreConfig | null): string => {
  const code = typeof (store as any)?.code === 'string' ? String((store as any).code) : '';
  const locale = typeof (store as any)?.locale === 'string' ? String((store as any).locale) : '';
  const currency =
    typeof (store as any)?.default_display_currency_code === 'string'
      ? String((store as any).default_display_currency_code)
      : typeof (store as any)?.currency === 'string'
        ? String((store as any).currency)
        : '';
  return [code, locale, currency].filter(Boolean).join('|') || 'default';
};

const urlResolverCache = getGlobalTtlCache<UrlResolverResult | null>('magentoRouting.urlResolver', {
  ttlMs: CACHE_TTL_MS,
  maxEntries: CACHE_MAX_ENTRIES
});

const categoryByUrlPathCache = getGlobalTtlCache<any | null>('magentoRouting.categoryByUrlPath', {
  ttlMs: CACHE_TTL_MS,
  maxEntries: CACHE_MAX_ENTRIES
});

const productByUrlKeyCache = getGlobalTtlCache<any | null>('magentoRouting.productByUrlKey', {
  ttlMs: CACHE_TTL_MS,
  maxEntries: CACHE_MAX_ENTRIES
});

const cmsByIdentifierCache = getGlobalTtlCache<any | null>('magentoRouting.cmsByIdentifier', {
  ttlMs: CACHE_TTL_MS,
  maxEntries: CACHE_MAX_ENTRIES
});

const categoryListingCache = getGlobalTtlCache<unknown | null>('magentoRouting.categoryListing', {
  ttlMs: CACHE_TTL_MS,
  maxEntries: CACHE_MAX_ENTRIES
});

const makeResolverCandidates = (path: string): string[] => {
  const p = normalizePath(path);
  if (!p) return [];
  const noHtml = p.endsWith('.html') ? p.slice(0, -5) : p;
  return uniq([p, noHtml, `${noHtml}.html`]).filter(Boolean);
};

const runUrlResolver = async (url: string): Promise<UrlResolverResult | null> => {
  // Magento GraphQL schema differs slightly between versions (snake_case vs camelCase redirect code).
  const queries = [
    `
      query UrlResolver($url: String!) {
        urlResolver(url: $url) {
          type
          relative_url
          redirect_code
        }
      }
    `,
    `
      query UrlResolver($url: String!) {
        urlResolver(url: $url) {
          type
          relative_url
          redirectCode
        }
      }
    `,
    `
      query UrlResolver($url: String!) {
        urlResolver(url: $url) {
          type
          relative_url
        }
      }
    `
  ];

  for (const payload of queries) {
    try {
      const req = MagentoGraphQLRequestFactory.create({
        method: 'POST',
        payload,
        variables: { url },
        operationId: 'magentoRouting.urlResolver'
      });
      const res = await executeGraphQLRequest(req);
      if (res.errors) {
        // Try next query variant (field mismatch).
        continue;
      }
      const data = (res.data as any)?.urlResolver;
      if (!data) return null;
      return data as UrlResolverResult;
    } catch {
      // try next variant/candidate
    }
  }
  return null;
};

const resolveMagentoRoute = async (path: string, storeCacheKey: string) => {
  const candidates = makeResolverCandidates(path);
  for (const candidate of candidates) {
    const key = `${storeCacheKey}::${candidate}`;
    const cached = urlResolverCache.get(key);
    const resolved = await urlResolverCache.getOrSet(key, () => runUrlResolver(candidate));
    if (resolved) {
      return { candidate, resolved, debug: { cacheKey: key, cacheHit: cached !== undefined } };
    }
  }
  return null;
};

const extractLastSegment = (relativeUrl: string): string => {
  const cleaned = normalizePath(relativeUrl);
  const last = cleaned.split('/').filter(Boolean).pop() ?? cleaned;
  return last.endsWith('.html') ? last.slice(0, -5) : last;
};

const normalizeRedirectTarget = (relativeUrl: string): string => {
  const cleaned = normalizePath(relativeUrl);
  if (!cleaned) return '/';
  const noLeading = cleaned.replace(/^\/+/, '');
  return `/${noLeading}`;
};

type HandlerArgs = {
  req: Request;
  store?: StoreConfig | null;
};

export default async function handleMagentoRoute({ req, store }: HandlerArgs) {
  const isDebug = (req as any)?.headers?.['x-renia-debug-route'] === '1';
  const path = normalizePath(req.path);
  if (!path) {
    // Keep "/" handled by the app shell for now.
    return { contexts: [], meta: { type: 'default' } };
  }

  const storeCacheKey = getStoreCacheKey(store ?? null);
  const result = await resolveMagentoRoute(path, storeCacheKey);
  if (!result?.resolved?.type) {
    return { contexts: ['not-found'], meta: { type: 'not-found', layout: '@renia/framework/layout/layouts/Layout1Column' } };
  }

  const redirectCode =
    typeof result.resolved.redirect_code === 'number'
      ? result.resolved.redirect_code
      : typeof result.resolved.redirectCode === 'number'
        ? result.resolved.redirectCode
        : null;
  const redirectTarget =
    typeof result.resolved.relative_url === 'string' && result.resolved.relative_url
      ? normalizeRedirectTarget(result.resolved.relative_url)
      : null;

  if (redirectCode && redirectTarget) {
    return {
      contexts: [],
      meta: {
        type: 'redirect',
        redirectCode,
        redirectTo: redirectTarget
      }
    };
  }

  const type = String(result.resolved.type).toUpperCase();
  const relativeUrl = typeof result.resolved.relative_url === 'string' ? result.resolved.relative_url : '';

  if (type === 'CATEGORY') {
    const repo = createCategoryRepository();
    const urlPathCandidates = makeResolverCandidates(relativeUrl || path);
    let category = null as any;
    const categoryDebug: any = isDebug ? { urlPathCandidates: urlPathCandidates.slice(), cache: [] as any[] } : null;
    for (const p of urlPathCandidates) {
      const key = `${storeCacheKey}::${p}`;
      const cached = categoryByUrlPathCache.get(key);
      category = await categoryByUrlPathCache.getOrSet(key, () => repo.getByUrlPath(p));
      if (categoryDebug) categoryDebug.cache.push({ kind: 'categoryByUrlPath', key, hit: cached !== undefined });
      if (category) break;
    }
    if (!category) {
      return { contexts: ['category'], meta: { type: 'category', layout: '@renia/framework/layout/layouts/Layout2ColumnsLeft' } };
    }

    const cfg = extractCatalogStorefrontConfig(store ?? null);
    const pageSize = cfg?.gridPerPage ?? cfg?.gridPerPageValues?.[0] ?? DEFAULT_PAGE_SIZE;

    let categoryProductListing: unknown = null;
    let listingDebug: any = null;
    try {
      const criteria = {
        filterGroups: [{ filters: [{ field: 'category_uid', value: category.id }] }],
        pageSize,
        currentPage: 1
      };
      const listingKey = `${storeCacheKey}::${category.id}::${pageSize}::page=1`;
      if (isDebug) {
        const cached = categoryListingCache.get(listingKey);
        listingDebug = { kind: 'categoryListing', key: listingKey, hit: cached !== undefined, pageSize };
      }
      categoryProductListing = await categoryListingCache.getOrSet(listingKey, () => prefetchProductListing(criteria as any));
    } catch (error) {
      console.error('[MagentoRouteHandler] Failed to prefetch category product listing', {
        categoryUid: category.id,
        error
      });
    }

    return {
      contexts: ['category'],
      meta: {
        type: 'category',
        layout: '@renia/framework/layout/layouts/Layout2ColumnsLeft',
        category: {
          id: category.id,
          label: category.label,
          urlPath: category.urlPath,
          description: category.description,
          image: category.image
        },
        categoryProductListing,
        ...(isDebug
          ? {
              __debug: {
                storeCacheKey,
                urlResolver: { candidate: result.candidate, resolved: result.resolved, ...result.debug },
                caches: {
                  category: categoryDebug,
                  listing: listingDebug
                }
              }
            }
          : null)
      }
    };
  }

  if (type === 'PRODUCT') {
    const urlKey = extractLastSegment(relativeUrl || path);
    const productKey = urlKey ? `${storeCacheKey}::${urlKey}` : null;
    const cached = productKey ? productByUrlKeyCache.get(productKey) : undefined;
    const product = urlKey && productKey ? await productByUrlKeyCache.getOrSet(productKey, () => fetchProduct({ urlKey })) : null;
    return {
      contexts: ['product'],
      meta: {
        type: 'product',
        layout: '@renia/framework/layout/layouts/Layout2ColumnsLeft',
        productUrlKey: urlKey || null,
        product: product ?? null,
        ...(isDebug
          ? {
              __debug: {
                storeCacheKey,
                urlResolver: { candidate: result.candidate, resolved: result.resolved, ...result.debug },
                caches: {
                  product: productKey ? { kind: 'productByUrlKey', key: productKey, hit: cached !== undefined } : null
                }
              }
            }
          : null)
      }
    };
  }

  if (type === 'CMS_PAGE') {
    const identifier = normalizePath(relativeUrl || path).replace(/\.html$/i, '');
    const cmsKey = identifier ? `${storeCacheKey}::${identifier}` : null;
    const cached = cmsKey ? cmsByIdentifierCache.get(cmsKey) : undefined;
    const cmsPage = identifier && cmsKey ? await cmsByIdentifierCache.getOrSet(cmsKey, () => fetchCmsPage({ identifier })) : null;
    return {
      contexts: ['cms'],
      meta: {
        type: 'cms',
        layout: '@renia/framework/layout/layouts/Layout1Column',
        cmsPageIdentifier: identifier || null,
        cmsPage,
        ...(isDebug
          ? {
              __debug: {
                storeCacheKey,
                urlResolver: { candidate: result.candidate, resolved: result.resolved, ...result.debug },
                caches: {
                  cms: cmsKey ? { kind: 'cmsByIdentifier', key: cmsKey, hit: cached !== undefined } : null
                }
              }
            }
          : null)
      }
    };
  }

  return { contexts: ['not-found'], meta: { type: 'not-found', layout: '@renia/framework/layout/layouts/Layout1Column' } };
}
