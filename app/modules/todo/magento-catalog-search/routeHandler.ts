// @env: server
import type { Request } from 'express';
import type { SearchCriteria } from '@renia/framework/api';
import type { ProductSearchResults } from 'renia-magento-product';
import { prefetchProductListing } from 'renia-magento-product-listing/services/productListingPrefetch';
import type { StoreConfig } from 'renia-magento-store';
import {
  DEFAULT_PAGE_SIZE,
  extractCatalogStorefrontConfig
} from 'renia-magento-product-listing/services/storefrontConfig';

const buildSearchCriteria = (query: string, pageSize: number): SearchCriteria => ({
  filterGroups: [],
  search: query,
  pageSize,
  currentPage: 1
});

const extractQuery = (req: Request): string | undefined => {
  if (typeof req.query?.q === 'string') return req.query.q;
  if (typeof req.query?.query === 'string') return req.query.query as string;
  const url = req.url ?? '';
  const [, queryString] = url.split('?');
  if (!queryString) return undefined;
  const params = new URLSearchParams(queryString);
  return params.get('q') ?? params.get('query') ?? undefined;
};

const fetchInitialSearchListing = async (
  query: string,
  pageSize: number
): Promise<ProductSearchResults | null> => {
  if (!query) return null;
  try {
    const criteria = buildSearchCriteria(query, pageSize);
    return await prefetchProductListing(criteria);
  } catch (error) {
    console.error('[SearchRouteHandler] Failed to fetch initial product listing', {
      query,
      error
    });
    return null;
  }
};

type HandlerArgs = {
  req: Request;
  store?: StoreConfig | null;
};

export default async function handleSearchRoute({ req, store }: HandlerArgs) {
  const query = (extractQuery(req) ?? '').trim();
  if (!query) {
    return { meta: { searchQuery: '' } };
  }

  const cfg = extractCatalogStorefrontConfig(store);
  const pageSize = cfg?.gridPerPage ?? cfg?.gridPerPageValues?.[0] ?? DEFAULT_PAGE_SIZE;

  const searchProductListing = await fetchInitialSearchListing(query, pageSize);

  return {
    meta: {
      searchQuery: query,
      searchProductListing
    }
  };
}
