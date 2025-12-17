// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'magento-product';
import { useStorefrontPageSize } from './useStorefrontPageSize';
import { useSortOptions, buildSortOptions, makeSortValue } from './useSortOptions';
import { usePagination } from './usePagination';
import { useProductRepository } from './useProductRepository';
import { useDerivedListingState } from './useDerivedListingState';

const DEFAULT_SORT_VALUE = 'relevance';

type CriteriaBuilderArgs = {
  page: number;
  pageSize: number;
  sortOrders?: { field: string; direction: 'ASC' | 'DESC' }[];
};

type UseProductListingArgs = {
  initialListing?: ProductSearchResults | null;
  buildCriteria: (args: CriteriaBuilderArgs) => SearchCriteria | null;
  resetKey?: string;
};

/**
 * useProductListing - Orchestrator hook for product listing
 *
 * RESPONSIBILITY: ONLY orchestration - composes utilities into high-level API
 *
 * Composes:
 * - useProductRepository() - GraphQL fetching
 * - useSortOptions() - Sort state management
 * - usePagination() - Pagination calculations
 * - useStorefrontPageSize() - Page size preferences
 * - useDerivedListingState() - UI-ready state derivation
 *
 * Changes from previous version:
 * - Extracted sort logic → useSortOptions.ts
 * - Extracted pagination logic → usePagination.ts
 * - Extracted repository logic → useProductRepository.ts
 * - Extracted state derivation → useDerivedListingState.ts
 * - This file now: ~70 lines (was 243)
 * - Public API unchanged - backward compatible
 */
export const useProductListing = ({
  initialListing,
  buildCriteria,
  resetKey
}: UseProductListingArgs) => {
  const { pageSize, pageSizeOptions, setUserPageSize } = useStorefrontPageSize({ resetKey });
  const repository = useProductRepository(initialListing);
  const sortOptions = useSortOptions(
    initialListing?.defaultSort && initialListing.defaultSort.length
      ? makeSortValue(initialListing.defaultSort, 'ASC')
      : DEFAULT_SORT_VALUE
  );
  const pagination = usePagination(pageSize, repository.total, initialListing?.searchCriteria?.currentPage ?? 1);
  const derived = useDerivedListingState(
    repository.products,
    repository.total,
    repository.status,
    repository.hasLoadedOnce,
    initialListing?.sortOptions,
    sortOptions.sort
  );

  // Reset sort + pagination when resetKey changes
  React.useEffect(() => {
    if (resetKey === undefined) return;
    sortOptions.handleResetSort();
    pagination.resetPage();
  }, [resetKey, sortOptions, pagination]);

  // Build criteria from current state
  const criteria = React.useMemo<SearchCriteria | null>(() => {
    return buildCriteria({
      page: pagination.page,
      pageSize: pageSize,
      sortOrders: sortOptions.sortOrders
    });
  }, [buildCriteria, pagination.page, pageSize, sortOptions.sortOrders]);

  // Fetch products when criteria changes
  React.useEffect(() => {
    const cleanup = repository.fetchProducts(criteria);
    return cleanup;
  }, [criteria, repository]);

  // Reset page to 1 when user changes sort
  React.useEffect(() => {
    if (sortOptions.userSelectedSort) {
      pagination.resetPage();
    }
  }, [sortOptions.userSelectedSort, pagination]);

  // Reset page to 1 when user changes page size
  const handlePageSizeChange = React.useCallback(
    (value: number) => {
      setUserPageSize(value);
      pagination.resetPage();
    },
    [setUserPageSize, pagination]
  );

  const isInitialLoading = repository.status === 'loading' && !repository.hasLoadedOnce;

  return {
    status: repository.status,
    isInitialLoading,
    listing: {
      products: derived.products,
      total: derived.total,
      sort: derived.sortValue,
      sortOptions: derived.sortOptions,
      page: pagination.page,
      pageSize: pagination.pageSize,
      pageSizeOptions
    },
    handlers: {
      onSortChange: sortOptions.handleSortChange,
      onItemsPerPageChange: handlePageSizeChange,
      onPageChange: pagination.setPage
    }
  };
};

export default useProductListing;
