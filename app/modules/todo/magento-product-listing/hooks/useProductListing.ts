// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@renia/framework/api';
import type { ProductSearchResults } from 'renia-magento-product';
import { useStorefrontPageSize } from './useStorefrontPageSize';
import { useSortOptions } from './useSortOptions';
import { usePagination } from './usePagination';
import { useProductRepository } from './useProductRepository';
import { useDerivedListingState } from './useDerivedListingState';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  applyListingQuery,
  normalizeListingQuery,
  readListingQueryState,
  type ListingQueryDefaults
} from '@renia/framework/router/listingQuery';

const DEFAULT_SORT_VALUE = 'relevance';

type CriteriaBuilderArgs = {
  page: number;
  pageSize: number;
  sortOrders?: { field: string; direction: 'ASC' | 'DESC' }[];
};

type UseProductListingArgs = {
  buildCriteria: (args: CriteriaBuilderArgs) => SearchCriteria | null;
  resetKey?: string;
  initialListing?: ProductSearchResults | null;
  urlSync?: boolean;
};

export const useProductListing = ({
  buildCriteria,
  resetKey,
  initialListing,
  urlSync
}: UseProductListingArgs) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isClient = typeof window !== 'undefined';
  const prevResetKeyRef = React.useRef<string | undefined>(resetKey);

  const { pageSize, pageSizeOptions, defaultPageSize, setUserPageSize } = useStorefrontPageSize({ resetKey });
  const repository = useProductRepository(initialListing, resetKey);

  const urlState = React.useMemo(
    () => (urlSync ? readListingQueryState(location.search, { sort: DEFAULT_SORT_VALUE }) : null),
    [location.search, urlSync]
  );

  const effectivePageSize = urlSync && urlState?.pageSize ? urlState.pageSize : pageSize;

  const sortOptions = useSortOptions(urlState?.sort ?? DEFAULT_SORT_VALUE);
  const pagination = usePagination(effectivePageSize, repository.total, urlState?.page ?? 1);

  const listingDefaults = React.useMemo<ListingQueryDefaults>(
    () => ({
      page: 1,
      sort: DEFAULT_SORT_VALUE,
      pageSize: defaultPageSize
    }),
    [defaultPageSize]
  );
  const derived = useDerivedListingState(
    repository.products,
    repository.total,
    repository.status,
    repository.hasLoadedOnce,
    undefined,
    sortOptions.sort
  );

  React.useEffect(() => {
    if (prevResetKeyRef.current === resetKey) return;
    prevResetKeyRef.current = resetKey;
    if (resetKey === undefined) return;
    sortOptions.handleResetSort();
    pagination.resetPage();

    if (!urlSync || !isClient) return;
    // Reset listing params on context change (category switch, new search term, etc.).
    const nextSearch = applyListingQuery(location.search, { page: 1, sort: DEFAULT_SORT_VALUE }, listingDefaults);
    if (nextSearch !== location.search) {
      navigate(`${location.pathname}${nextSearch}${location.hash ?? ''}`, { replace: true });
    }
  }, [
    isClient,
    listingDefaults,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    pagination.resetPage,
    resetKey,
    sortOptions.handleResetSort,
    urlSync
  ]);

  // Sync internal state from URL (back/forward, manual edits). This runs only on the client.
  React.useEffect(() => {
    if (!urlSync || !isClient || !urlState) return;

    // Canonicalize listing query params (aliases, duplicates, defaults).
    const normalized = normalizeListingQuery(location.search, listingDefaults);
    if (normalized !== location.search) {
      navigate(`${location.pathname}${normalized}${location.hash ?? ''}`, { replace: true });
      return;
    }

    if (sortOptions.sort !== urlState.sort) {
      sortOptions.setSortValue(urlState.sort, { user: false });
    }
    if (pagination.page !== urlState.page) {
      pagination.setPage(urlState.page);
    }
    if (urlState.pageSize && urlState.pageSize !== pageSize) {
      setUserPageSize(urlState.pageSize);
    }
  }, [
    isClient,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    pageSize,
    pagination.page,
    pagination.setPage,
    setUserPageSize,
    listingDefaults,
    sortOptions.setSortValue,
    sortOptions.sort,
    urlState,
    urlSync
  ]);

  const sortOrdersKey = React.useMemo(
    () => JSON.stringify(sortOptions.sortOrders),
    [sortOptions.sortOrders]
  );

  const criteria = React.useMemo<SearchCriteria | null>(() => {
    return buildCriteria({
      page: pagination.page,
      pageSize: effectivePageSize,
      sortOrders: sortOptions.sortOrders
    });
  }, [buildCriteria, effectivePageSize, pagination.page, sortOrdersKey]);

  React.useEffect(() => {
    const cleanup = repository.fetchProducts(criteria);
    return cleanup;
  }, [criteria, repository.fetchProducts]);

  React.useEffect(() => {
    if (sortOptions.userSelectedSort) {
      pagination.resetPage();
    }
  }, [sortOptions.userSelectedSort, pagination.resetPage]);

  const handlePageSizeChange = React.useCallback(
    (value: number) => {
      setUserPageSize(value);
      pagination.resetPage();
    },
    [setUserPageSize, pagination.resetPage]
  );

  const isInitialLoading = repository.status === 'loading' && !repository.hasLoadedOnce;

  const syncUrl = React.useCallback(
    (next: { page?: number; pageSize?: number; sort?: string }, options?: { replace?: boolean }) => {
      if (!urlSync || !isClient) return;
      const nextSearch = applyListingQuery(location.search, next, listingDefaults);
      if (nextSearch === location.search) return;
      navigate(`${location.pathname}${nextSearch}${location.hash ?? ''}`, { replace: options?.replace ?? false });
    },
    [isClient, listingDefaults, location.hash, location.pathname, location.search, navigate, urlSync]
  );

  const handlePageChange = React.useCallback(
    (nextPage: number) => {
      pagination.setPage(nextPage);
      syncUrl({ page: nextPage });
    },
    [pagination.setPage, syncUrl]
  );

  const handleSortChange = React.useCallback(
    (nextSort: string) => {
      sortOptions.handleSortChange(nextSort);
      pagination.resetPage();
      syncUrl({ sort: nextSort, page: 1 });
    },
    [pagination.resetPage, sortOptions.handleSortChange, syncUrl]
  );

  const handleItemsPerPageChange = React.useCallback(
    (value: number) => {
      const normalized = setUserPageSize(value);
      pagination.resetPage();
      syncUrl({ pageSize: normalized, page: 1 });
    },
    [pagination.resetPage, setUserPageSize, syncUrl]
  );

  return {
    status: repository.status,
    isInitialLoading,
    listing: {
      products: derived.products,
      total: derived.total,
      sort: derived.sortValue,
      sortOptions: derived.sortOptions,
      page: pagination.page,
      pageSize: effectivePageSize,
      pageSizeOptions
    },
    handlers: {
      onSortChange: urlSync ? handleSortChange : sortOptions.handleSortChange,
      onItemsPerPageChange: urlSync ? handleItemsPerPageChange : handlePageSizeChange,
      onPageChange: urlSync ? handlePageChange : pagination.setPage
    }
  };
};

export default useProductListing;
