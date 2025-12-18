// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'renia-magento-product';
import { useProductListing } from 'renia-magento-product-listing/hooks/useProductListing';

type UseSearchProductListArgs = {
  query?: string;
  initialListing?: ProductSearchResults | null;
};

export const useSearchProductList = ({
  query,
  initialListing
}: UseSearchProductListArgs) => {
  const normalizedQuery = (query ?? '').trim();

  const buildCriteria = React.useCallback(
    ({
      page,
      pageSize,
      sortOrders
    }: {
      page: number;
      pageSize: number;
      sortOrders?: SearchCriteria['sortOrders'];
    }) => {
      if (!normalizedQuery) return null;
      const criteria: SearchCriteria = {
        filterGroups: [],
        search: normalizedQuery,
        pageSize,
        currentPage: page,
        sortOrders
      };
      return criteria;
    },
    [normalizedQuery]
  );

  return useProductListing({
    initialListing,
    buildCriteria,
    resetKey: normalizedQuery || undefined
  });
};

export default useSearchProductList;
