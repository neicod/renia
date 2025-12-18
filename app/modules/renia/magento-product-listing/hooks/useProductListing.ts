// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'renia-magento-product';
import { useStorefrontPageSize } from './useStorefrontPageSize';
import { useSortOptions } from './useSortOptions';
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
  buildCriteria: (args: CriteriaBuilderArgs) => SearchCriteria | null;
  resetKey?: string;
  initialListing?: ProductSearchResults | null;
};

export const useProductListing = ({
  buildCriteria,
  resetKey,
  initialListing
}: UseProductListingArgs) => {
  const { pageSize, pageSizeOptions, setUserPageSize } = useStorefrontPageSize({ resetKey });
  const repository = useProductRepository(initialListing);
  const sortOptions = useSortOptions(DEFAULT_SORT_VALUE);
  const pagination = usePagination(pageSize, repository.total, 1);
  const derived = useDerivedListingState(
    repository.products,
    repository.total,
    repository.status,
    repository.hasLoadedOnce,
    undefined,
    sortOptions.sort
  );

  React.useEffect(() => {
    if (resetKey === undefined) return;
    sortOptions.handleResetSort();
    pagination.resetPage();
  }, [resetKey, sortOptions.handleResetSort, pagination.resetPage]);

  const sortOrdersKey = React.useMemo(
    () => JSON.stringify(sortOptions.sortOrders),
    [sortOptions.sortOrders]
  );

  const criteria = React.useMemo<SearchCriteria | null>(() => {
    return buildCriteria({
      page: pagination.page,
      pageSize: pageSize,
      sortOrders: sortOptions.sortOrders
    });
  }, [buildCriteria, pagination.page, pageSize, sortOrdersKey]);

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
