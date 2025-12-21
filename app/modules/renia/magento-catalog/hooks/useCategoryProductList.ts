// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'renia-magento-product';
import { useProductListing } from 'renia-magento-product-listing/hooks/useProductListing';

type UseCategoryProductListArgs = {
  categoryUid?: string;
  initialListing?: ProductSearchResults | null;
};

export const useCategoryProductList = ({
  categoryUid,
  initialListing
}: UseCategoryProductListArgs) => {
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
      if (!categoryUid) {
        return null;
      }

      const criteria: SearchCriteria = {
        filterGroups: [{ filters: [{ field: 'category_uid', value: categoryUid }] }],
        pageSize,
        currentPage: page,
        sortOrders
      };
      return criteria;
    },
    [categoryUid]
  );

  return useProductListing({
    initialListing,
    buildCriteria,
    resetKey: categoryUid
  });
};

export default useCategoryProductList;
