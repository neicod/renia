// @env: server
// Główne entry serwera SSR: Express + render AppRoot z tras/layoutów/interceptorów.
// Musi pozostać tu jako punkt startu; nie przenoś/nie usuwaj, inaczej SSR/serwowanie statyków przestanie działać.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { loadRoutesRegistry } from '@framework/router';
import { matchPath } from 'react-router-dom';
import { loadInterceptors } from 'renia-interceptors';
import AppRoot from '@framework/runtime/AppRoot';
import { htmlTemplate } from './template';
import { LayoutTreeBuilder, buildRegions, ExtensionsRegistry, Layout1Column, Layout2ColumnsLeft, LayoutEmpty } from '@framework/layout';
import type { MenuItem } from 'renia-menu';
import { loadComponentRegistrations } from '@framework/registry/loadModuleComponents';
import { registerComponents } from '@framework/registry/componentRegistry';
import { registerProductTypeComponentStrategy } from 'renia-magento-product/services/productStrategies';
import { getStoreConfig } from 'renia-magento-store';
import { loadMessages as loadI18nMessages } from 'renia-i18n/services/loader';
import type { PageContext } from '@framework/runtime/PageContext';
import { applyPageContextAugmenters } from '@framework/runtime/pageContextAugmenters';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const staticDir = path.resolve(process.cwd(), 'dist/public');
const clientEntry = path.resolve(process.cwd(), 'src/client/index.tsx');
const clientOutFile = path.join(staticDir, 'index.js');
const assetVersionFile = path.join(staticDir, '.asset-version');

let clientBundleReady = false;
const ensureClientBundle = async () => {
  if (clientBundleReady) return;
  if (fs.existsSync(clientOutFile)) {
    clientBundleReady = true;
    return;
  }
  if (process.env.NODE_ENV === 'production') return;

  try {
    await fs.promises.mkdir(staticDir, { recursive: true });
    const esbuild = await import('esbuild');
    await esbuild.build({
      entryPoints: [clientEntry],
      bundle: true,
      sourcemap: true,
      format: 'esm',
      outfile: clientOutFile,
      loader: { '.tsx': 'tsx', '.ts': 'ts' },
      plugins: []
    });
    clientBundleReady = true;
  } catch (err) {
    console.error('Nie udało się zbudować paczki klienta (auto):', err);
  }
};

await ensureClientBundle();

app.use('/static', express.static(staticDir, { index: false }));
app.use(express.json({ limit: '1mb' }));

let cachedAssetVersion: { value: string | null; mtimeMs: number } | null = null;

const readAssetVersion = () => {
  try {
    const stats = fs.statSync(assetVersionFile);
    const version =
      cachedAssetVersion && cachedAssetVersion.mtimeMs === stats.mtimeMs
        ? cachedAssetVersion.value
        : fs.readFileSync(assetVersionFile, 'utf8').trim() || null;
    cachedAssetVersion = { value: version, mtimeMs: stats.mtimeMs };
    return version;
  } catch {
    cachedAssetVersion = null;
    return null;
  }
};

const resolveClientAssetPath = () => {
  const version = readAssetVersion();
  if (version) {
    return `/static/index.js?v=${encodeURIComponent(version)}`;
  }
  if (process.env.NODE_ENV !== 'production') {
    return `/static/index.js?v=${Date.now()}`;
  }
  return '/static/index.js';
};

const sortByPriority = <T extends { priority?: number }>(entries: T[]) =>
  entries.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

const isSsrDebugEnabled = (): boolean => {
  const raw = process.env.SSR_DEBUG;
  return raw === '1' || raw === 'true';
};

const parseJsonEnv = <T,>(name: string, fallback: T): T => {
  const raw = process.env[name];
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[SSR] Invalid JSON in ${name}, using fallback`, { error });
    return fallback;
  }
};

type PrefixResolution = {
  basePath: string; // e.g. "/pl" or ""
  routingPath: string; // path without basePath, always starts with "/"
  storeCode?: string;
  locale?: string;
};

const resolvePrefixFromPath = (pathValue: string): PrefixResolution => {
  const singleStoreRaw = process.env.MAGENTO_SINGLE_STORE;
  const isSingleStore = singleStoreRaw !== '0' && singleStoreRaw !== 'false';

  const normalizedPath = (pathValue || '/').startsWith('/') ? (pathValue || '/') : `/${pathValue || ''}`;

  if (isSingleStore) {
    return { basePath: '', routingPath: normalizedPath };
  }

  const prefixToStore = parseJsonEnv<Record<string, string>>('MAGENTO_STORE_PREFIX_MAP', {});
  const prefixToLocale = parseJsonEnv<Record<string, string>>('MAGENTO_LOCALE_PREFIX_MAP', {});

  const [, maybePrefix] = normalizedPath.split('/', 3);
  if (!maybePrefix) return { basePath: '', routingPath: normalizedPath };

  const storeCode = prefixToStore[maybePrefix];
  if (!storeCode) return { basePath: '', routingPath: normalizedPath };

  const basePath = `/${maybePrefix}`;
  const rest = normalizedPath.slice(basePath.length) || '/';
  const routingPath = rest.startsWith('/') ? rest : `/${rest}`;

  return {
    basePath,
    routingPath,
    storeCode,
    locale: prefixToLocale[maybePrefix]
  };
};

const withOverriddenPath = <T extends object>(req: T, routingPath: string): T => {
  return new Proxy(req, {
    get(target, prop, receiver) {
      if (prop === 'path') return routingPath;
      return Reflect.get(target, prop, receiver);
    }
  });
};

const isRoutesCacheEnabled = (): boolean => {
  const raw = process.env.ROUTES_CACHE_ENABLED;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return process.env.NODE_ENV === 'production';
};

let cachedRoutes: Awaited<ReturnType<typeof loadRoutesRegistry>> | null = null;
let cachedEnabledModules: string[] | null = null;
let cachedConfigMtimeMs: number | null = null;

const isComponentRegistrationsCacheEnabled = (): boolean => {
  const raw = process.env.COMPONENT_REGISTRATIONS_CACHE_ENABLED;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return process.env.NODE_ENV === 'production';
};

let cachedComponentRegistrationsMtimeMs: number | null = null;

// Removed: contextFromPath - now using route.contexts from routes.ts
// Each route explicitly defines its contexts instead of inferring from path

// NOTE:
// - Layout regions are derived from LayoutTreeBuilder via buildRegions().
// - Component-level extensions are collected via ExtensionsRegistry.

app.post('/api/magento/graphql', async (req, res) => {
  const upstream = process.env.MAGENTO_GRAPHQL_ENDPOINT;
  if (!upstream) {
    return res.status(500).json({ error: 'Brak MAGENTO_GRAPHQL_ENDPOINT' });
  }

  try {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(req.headers['authorization'] ? { authorization: String(req.headers['authorization']) } : {})
    };

    if (process.env.MAGENTO_STORE_CODE) {
      headers['store'] = process.env.MAGENTO_STORE_CODE;
    }
    if (process.env.MAGENTO_HOST_HEADER) {
      headers['host'] = process.env.MAGENTO_HOST_HEADER;
    }

    const upstreamResp = await fetch(upstream, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body ?? {})
    });

    const text = await upstreamResp.text();
    res
      .status(upstreamResp.status)
      .set('content-type', upstreamResp.headers.get('content-type') ?? 'application/json')
      .send(text);
  } catch (error) {
    console.error('Błąd proxy GraphQL:', error);
    res.status(502).json({ error: 'Proxy GraphQL nieosiągalne', details: String(error) });
  }
});

app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(staticDir, 'favicon.ico');
  if (fs.existsSync(faviconPath)) {
    return res.sendFile(faviconPath);
  }
  res.status(204).end();
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.get('/api/page-context', async (req, res) => {
  try {
    const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
    const cacheEnabled = isRoutesCacheEnabled();
    const configStat = fs.existsSync(configPath) ? fs.statSync(configPath) : null;
    const configMtimeMs = configStat?.mtimeMs ?? null;

    const canUseCache =
      cacheEnabled &&
      cachedRoutes &&
      cachedEnabledModules &&
      cachedConfigMtimeMs !== null &&
      configMtimeMs !== null &&
      cachedConfigMtimeMs === configMtimeMs;

    const enabledModules = (() => {
      if (canUseCache) return cachedEnabledModules!;
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return Object.entries(config.modules ?? {})
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
    })();

    const componentsCacheEnabled = isComponentRegistrationsCacheEnabled();
    const canSkipComponentRegistrations =
      componentsCacheEnabled &&
      cachedComponentRegistrationsMtimeMs !== null &&
      configMtimeMs !== null &&
      cachedComponentRegistrationsMtimeMs === configMtimeMs;

    if (!canSkipComponentRegistrations) {
      await loadComponentRegistrations({ configPath });
      if (componentsCacheEnabled && configMtimeMs !== null) {
        cachedComponentRegistrationsMtimeMs = configMtimeMs;
      }
    }

    const routes = canUseCache ? cachedRoutes! : await loadRoutesRegistry({ configPath });
    if (cacheEnabled && !canUseCache && configMtimeMs !== null) {
      cachedRoutes = routes;
      cachedEnabledModules = enabledModules;
      cachedConfigMtimeMs = configMtimeMs;
    }

    const rawUrl = typeof (req.query as any)?.url === 'string' ? String((req.query as any).url) : '';
    if (!rawUrl) {
      return res.status(400).json({ error: 'Missing url query parameter' });
    }

    const urlObj = new URL(rawUrl, 'http://local');
    const prefix = resolvePrefixFromPath(urlObj.pathname);
    const routingUrl = `${prefix.routingPath}${urlObj.search ?? ''}`;

    const match = routes.find((r) => matchPath({ path: r.path, end: false }, prefix.routingPath));
    const routeContexts = (match?.contexts ?? []) as string[];

    const statusMap = Object.fromEntries(enabledModules.map((name) => [name, true]));
    const layoutNoop: any = {
      get: () => layoutNoop,
      add: () => layoutNoop
    };
    const extensionsNoop = new ExtensionsRegistry();

    const api = {
      registerComponents,
      registerProductTypeComponentStrategy,
      layout: layoutNoop,
      extend: extensionsNoop
    };

    await loadInterceptors('default', { configPath, statusMap, includeDefault: true }, api);
    for (const ctx of routeContexts) {
      if (ctx !== 'default') {
        await loadInterceptors(ctx, { configPath, statusMap, includeDefault: false }, api);
      }
    }

    const appConfig: {
      magentoGraphQLEndpoint?: string;
      magentoProxyEndpoint?: string;
      magentoStoreCode?: string;
      store?: Awaited<ReturnType<typeof getStoreConfig>>;
    } = {
      magentoGraphQLEndpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      magentoProxyEndpoint: process.env.MAGENTO_PROXY_ENDPOINT ?? '/api/magento/graphql',
      magentoStoreCode: prefix.storeCode ?? process.env.MAGENTO_STORE_CODE
    };

    if (!appConfig.store) {
      try {
        const storeConfig = await getStoreConfig();
        appConfig.store = storeConfig;
        if (!appConfig.magentoStoreCode && storeConfig.code) {
          appConfig.magentoStoreCode = storeConfig.code;
        }
      } catch (err) {
        console.error('Nie udało się pobrać konfiguracji sklepu:', err);
      }
    }

    (globalThis as any).__APP_CONFIG__ = appConfig;

    const routeMeta = { ...(match?.meta ?? {}) } as Record<string, unknown>;

    if (match?.handler) {
      try {
        const handlerModule = await import(match.handler);
        const handler = handlerModule.default ?? handlerModule;
        if (typeof handler === 'function') {
          const query: Record<string, string> = {};
          for (const [k, v] of urlObj.searchParams.entries()) query[k] = v;
          const reqForHandler: any = {
            path: prefix.routingPath,
            url: routingUrl,
            query
          };
          const handlerResult =
            (await handler({
              req: reqForHandler,
              route: match,
              params: matchPath({ path: match.path, end: false }, prefix.routingPath)?.params ?? {},
              store: appConfig.store ?? null
            })) || {};
          if (handlerResult.meta && typeof handlerResult.meta === 'object') {
            Object.assign(routeMeta, handlerResult.meta);
          }
        }
      } catch (err) {
        console.error(`Nie udało się uruchomić handlera dla trasy ${match?.path}:`, err);
      }
    }

    const pageContext: PageContext = applyPageContextAugmenters(
      {
        kind: typeof (routeMeta as any)?.type === 'string' ? ((routeMeta as any).type as string) : 'default',
        store: {
          code: appConfig.magentoStoreCode ?? (appConfig.store as any)?.code ?? null
        },
        extensions: {}
      },
      {
        req: { path: prefix.routingPath, url: routingUrl },
        routeMeta,
        routeContexts
      }
    );

    // Minimal payload: client only needs the resolved PageContext
    return res.status(200).json({ pageContext });
  } catch (error) {
    console.error('Błąd /api/page-context:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.get('*', async (req, res) => {
  try {
    const ssrDebug = isSsrDebugEnabled();

    const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
    const prefix = resolvePrefixFromPath(req.path);
    const cacheEnabled = isRoutesCacheEnabled();
    const configStat = fs.existsSync(configPath) ? fs.statSync(configPath) : null;
    const configMtimeMs = configStat?.mtimeMs ?? null;

    const canUseCache =
      cacheEnabled &&
      cachedRoutes &&
      cachedEnabledModules &&
      cachedConfigMtimeMs !== null &&
      configMtimeMs !== null &&
      cachedConfigMtimeMs === configMtimeMs;

    const enabledModules = (() => {
      if (canUseCache) return cachedEnabledModules!;
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return Object.entries(config.modules ?? {})
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name);
    })();

    const componentsCacheEnabled = isComponentRegistrationsCacheEnabled();
    const canSkipComponentRegistrations =
      componentsCacheEnabled &&
      cachedComponentRegistrationsMtimeMs !== null &&
      configMtimeMs !== null &&
      cachedComponentRegistrationsMtimeMs === configMtimeMs;

    if (!canSkipComponentRegistrations) {
      await loadComponentRegistrations({ configPath });
      if (componentsCacheEnabled && configMtimeMs !== null) {
        cachedComponentRegistrationsMtimeMs = configMtimeMs;
      }
    }

    // Register framework layout components
    registerComponents({
      '@framework/layout/layouts/Layout1Column': Layout1Column,
      '@framework/layout/layouts/Layout2ColumnsLeft': Layout2ColumnsLeft,
      '@framework/layout/layouts/LayoutEmpty': LayoutEmpty
    });

    const routes = canUseCache ? cachedRoutes! : await loadRoutesRegistry({ configPath });
    if (cacheEnabled && !canUseCache && configMtimeMs !== null) {
      cachedRoutes = routes;
      cachedEnabledModules = enabledModules;
      cachedConfigMtimeMs = configMtimeMs;
    }

    let preloadedCategoryMenu: MenuItem[] | undefined;

    const appConfig: {
      magentoGraphQLEndpoint?: string;
      magentoRootCategoryId?: string;
      magentoProxyEndpoint?: string;
      magentoStoreCode?: string;
      preloadedCategoryMenu?: MenuItem[];
      store?: Awaited<ReturnType<typeof getStoreConfig>>;
    } = {
      magentoGraphQLEndpoint: process.env.MAGENTO_GRAPHQL_ENDPOINT,
      magentoRootCategoryId: process.env.MAGENTO_ROOT_CATEGORY_ID,
      magentoProxyEndpoint: process.env.MAGENTO_PROXY_ENDPOINT ?? '/api/magento/graphql',
      magentoStoreCode: prefix.storeCode ?? process.env.MAGENTO_STORE_CODE,
      preloadedCategoryMenu
    };

    // Udostępniamy config również w kontekście SSR, aby komponenty mogły z niego korzystać.
    (globalThis as any).__APP_CONFIG__ = appConfig;

    if (process.env.MAGENTO_GRAPHQL_ENDPOINT) {
      try {
        const { fetchMenu } = await import('renia-magento-category/services/menu');
        const rootCategoryId = process.env.MAGENTO_ROOT_CATEGORY_ID;
        const variables = rootCategoryId
          ? { filters: { parent_id: { eq: rootCategoryId } } }
          : undefined;

        preloadedCategoryMenu = await fetchMenu({
          variables,
          headers: process.env.MAGENTO_HOST_HEADER ? { host: process.env.MAGENTO_HOST_HEADER } : undefined
        });
        appConfig.preloadedCategoryMenu = preloadedCategoryMenu;
      } catch (err) {
        console.error('Nie udało się wstępnie pobrać menu kategorii:', err);
      }
    }

    if (!appConfig.store) {
      try {
        const storeConfig = await getStoreConfig();
        appConfig.store = storeConfig;
        if (!appConfig.magentoStoreCode && storeConfig.code) {
          appConfig.magentoStoreCode = storeConfig.code;
        }
      } catch (err) {
        console.error('Nie udało się pobrać konfiguracji sklepu:', err);
      }
    }

    // Build hierarchical layout tree using new API
    const layoutTree = new LayoutTreeBuilder();
    const extensions = new ExtensionsRegistry();

    const api = {
      registerComponents,
      registerProductTypeComponentStrategy,
      layout: layoutTree.get('page'), // Root API - start from page
      extend: extensions
    };

    // Build statusMap to filter interceptors by enabled modules
    const statusMap = Object.fromEntries(
      enabledModules.map((name) => [name, true])
    );

    // Load interceptors: always default, then route-specific contexts
    await loadInterceptors('default', { configPath, statusMap, includeDefault: true }, api);

    // Find matching route and get its contexts
    const match = routes.find((r) => matchPath({ path: r.path, end: false }, prefix.routingPath));
    const routeContexts = (match?.contexts ?? []) as string[];

    // Load context-specific interceptors (without re-running default)
    for (const ctx of routeContexts) {
      if (ctx !== 'default') {
        await loadInterceptors(ctx, { configPath, statusMap, includeDefault: false }, api);
      }
    }

    // Build the final layout tree and derive regions/extensions snapshot for rendering
    const builtTree = layoutTree.build();

    const regions = buildRegions(builtTree);
    const extensionsSnapshot = extensions.snapshotSorted();

    const routeMeta = { ...(match?.meta ?? {}) } as Record<string, unknown>;
    // Used by client to avoid reusing SSR-only meta (like initial listings) for a different URL.
    (routeMeta as any).__ssrPath = prefix.routingPath;

    if (match?.handler) {
      try {
        const handlerModule = await import(match.handler);
        const handler = handlerModule.default ?? handlerModule;
        if (typeof handler === 'function') {
          const reqForHandler = withOverriddenPath(req, prefix.routingPath);
          const handlerResult =
            (await handler({
              req: reqForHandler,
              route: match,
              params: matchPath({ path: match.path, end: false }, prefix.routingPath)?.params ?? {},
              store: appConfig.store ?? null
            })) ||
            {};
          if (handlerResult.meta && typeof handlerResult.meta === 'object') {
            Object.assign(routeMeta, handlerResult.meta);
          }
        }
      } catch (err) {
        console.error(`Nie udało się uruchomić handlera dla trasy ${match?.path}:`, err);
      }
    }

    const pageContext: PageContext = applyPageContextAugmenters(
      {
        kind: typeof (routeMeta as any)?.type === 'string' ? ((routeMeta as any).type as string) : 'default',
        store: {
          code: appConfig.magentoStoreCode ?? (appConfig.store as any)?.code ?? null
        },
        extensions: {}
      },
      {
        req: { path: req.path, url: req.url },
        routeMeta: (routeMeta ?? {}) as Record<string, unknown>,
        routeContexts
      }
    );

    if (routeMeta?.searchProductListing) {
      Object.values(regions).forEach((entries) => {
        entries.forEach((entry) => {
          if (
            entry.componentPath === 'renia-magento-catalog-search/components/SearchProductList' ||
            entry.component === 'renia-magento-catalog-search/components/SearchProductList'
          ) {
            entry.props = {
              ...(entry.props ?? {}),
              initialListing: routeMeta.searchProductListing
            };
          }
        });
      });
    }

    // Category product listing injection (similar to search pattern)
    if (ssrDebug) {
      console.log('[SSR] Category injection check:', {
        hasCategory: !!routeMeta?.category,
        categoryId: (routeMeta?.category as any)?.id,
        hasContexts: routeContexts.length,
        contexts: routeContexts,
        isCategoryContext: routeContexts.includes('category')
      });
    }

    if (routeMeta?.category?.id && routeContexts.includes('category')) {
      const categoryUid = (routeMeta.category as any).id;
      if (ssrDebug) console.log('[SSR] Starting category product fetch:', { categoryUid });

      // Fetch products for category SSR
      try {
        const { prefetchProductListing } = await import('renia-magento-product-listing/services/productListingPrefetch');
        const { extractCatalogStorefrontConfig, DEFAULT_PAGE_SIZE } = await import(
          'renia-magento-product-listing/services/storefrontConfig'
        );
        const cfg = extractCatalogStorefrontConfig(appConfig.store ?? null);
        const pageSize = cfg?.gridPerPage ?? cfg?.gridPerPageValues?.[0] ?? DEFAULT_PAGE_SIZE;

        const criteria = {
          filterGroups: [{ filters: [{ field: 'category_uid', value: categoryUid }] }],
          pageSize,
          currentPage: 1
        };
        if (ssrDebug) console.log('[SSR] Category fetch criteria:', criteria);

        const categoryProductListing = await prefetchProductListing(criteria);
        if (ssrDebug) {
          console.log('[SSR] Category products fetched:', {
            items: (categoryProductListing as any)?.items?.length ?? 0,
            totalCount: (categoryProductListing as any)?.totalCount ?? 0
          });
        }

        // Prefer attaching to routeMeta so page components can consume it directly
        (routeMeta as any).categoryProductListing = categoryProductListing;

        // Inject initialListing to CategoryProductList component props
        let injectionCount = 0;
        Object.values(regions).forEach((entries) => {
          entries.forEach((entry) => {
            const isMatch =
              entry.componentPath === 'renia-magento-catalog/components/CategoryProductList' ||
              entry.component === 'renia-magento-catalog/components/CategoryProductList';

            if (ssrDebug) {
              console.log('[SSR] Checking slot entry:', {
                componentPath: entry.componentPath,
                component: entry.component,
                isMatch
              });
            }

            if (isMatch) {
              if (ssrDebug) {
                console.log('[SSR] INJECTING initialListing to CategoryProductList!', {
                  before: (entry.props as any)?.initialListing ? 'had initialListing' : 'NO initialListing',
                  after: 'injected'
                });
              }

              entry.props = {
                ...(entry.props ?? {}),
                initialListing: categoryProductListing
              };
              injectionCount++;
            }
          });
        });
        if (ssrDebug) console.log('[SSR] Category injection complete:', { injectionCount });
      } catch (error) {
        console.error('[SSR] Failed to prefetch category products', { categoryUid, error });
        // Graceful degradation: CSR will fetch
      }
    }

    // I18n: wybierz język (storeConfig.locale) i dołącz scalone tłumaczenia z dist/i18n
    const lang = prefix.locale ?? appConfig.store?.locale ?? 'en_US';
    const i18nMessages = loadI18nMessages(lang);

    const bootstrap = {
      basePath: prefix.basePath,
      routes: routes.map((r) => ({
        path: r.path,
        component: r.component,
        componentPath: r.componentPath,
        contexts: (r as any).contexts ?? [],
        layout: (r.meta as any)?.layout ?? '@framework/layout/layouts/Layout1Column',
        meta: r.path === match?.path ? routeMeta : r.meta ?? {}
      })),
      regions,
      extensions: extensionsSnapshot,
      contexts: routeContexts, // ← Route-specific contexts for client
      enabledModules, // ← Pass enabled modules so CSR can filter interceptors
      pageContext,
      config: {
        ...appConfig,
        i18n: {
          lang,
          messages: i18nMessages
        }
      }
    };

    // Podaj initial translations do I18nBootstrap jeśli slot istnieje
    const overlay = bootstrap.regions?.['global-overlay'];
    if (overlay) {
      overlay.forEach((entry: any) => {
        if (
          entry.componentPath === 'renia-i18n/components/I18nBootstrap' ||
          entry.component === 'renia-i18n/components/I18nBootstrap'
        ) {
          entry.props = {
            ...(entry.props ?? {}),
            initialLang: lang,
            initialMessages: i18nMessages
          };
        }
      });
    }

    const appHtml = renderToString(
      <StaticRouter location={req.url} basename={prefix.basePath || undefined}>
        <AppRoot bootstrap={bootstrap} runtime="ssr" />
      </StaticRouter>
    );

    const html = htmlTemplate({
      appHtml,
      title: 'React SSR starter',
      assetPath: resolveClientAssetPath(),
      bootstrap
    });

    res
      .status(200)
      .setHeader('Content-Type', 'text/html')
      .send(html);
  } catch (error) {
    console.error('Błąd renderowania SSR:', error);
    res.status(500).send('Wewnętrzny błąd serwera');
  }
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  // intentionally silent in dev to reduce log noise
});
