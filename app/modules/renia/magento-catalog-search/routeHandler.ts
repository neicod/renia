// @env: server
import type { Request } from 'express';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'renia-magento-product';
import { prefetchProductListing } from 'renia-magento-catalog/services/productListingPrefetch';

const DEFAULT_PAGE_SIZE = 12;

const buildSearchCriteria = (query: string): SearchCriteria => ({
  filterGroups: [],
  search: query,
  pageSize: DEFAULT_PAGE_SIZE,
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
  query?: string
): Promise<ProductSearchResults | null> => {
  if (!query) return null;
  try {
    const criteria = buildSearchCriteria(query);
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
};

export default async function handleSearchRoute({ req }: HandlerArgs) {
  const query = (extractQuery(req) ?? '').trim();
  if (!query) {
    return { meta: { searchQuery: '' } };
  }

  const searchProductListing = await fetchInitialSearchListing(query);

  return {
    meta: {
      searchQuery: query,
      searchProductListing
    }
  };
}
