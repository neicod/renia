// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'magento-product';
import { useProductListing } from 'renia-magento-catalog/hooks/useProductListing';

type UseSearchProductListArgs = {
  env: 'ssr' | 'client';
  query?: string;
  initialListing?: ProductSearchResults | null;
};

export const useSearchProductList = ({
  env,
  query,
  initialListing
}: UseSearchProductListArgs) => {
  const normalizedQuery = (query ?? '').trim();

  const buildCriteria = React.useCallback(
    ({ page, pageSize, sortOrders }) => {
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
    env,
    initialListing,
    buildCriteria,
    resetKey: normalizedQuery || undefined
  });
};

export default useSearchProductList;
