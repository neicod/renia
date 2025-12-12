// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import type { ProductSearchResults } from 'magento-product';
import { useProductListing } from './useProductListing';

type UseCategoryProductListArgs = {
  env: 'ssr' | 'client';
  categoryUid?: string;
  initialListing?: ProductSearchResults | null;
};

export const useCategoryProductList = ({
  env,
  categoryUid,
  initialListing
}: UseCategoryProductListArgs) => {
  const buildCriteria = React.useCallback(
    ({ page, pageSize, sortOrders }) => {
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
    env,
    initialListing,
    buildCriteria,
    resetKey: categoryUid
  });
};

export default useCategoryProductList;
