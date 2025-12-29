// @env: mixed
import React from 'react';
import type { Product, ProductSortOption } from 'renia-magento-product';
import { buildSortOptions, type SortOption } from './useSortOptions';

export type DerivedListingState = {
  products: Product[];
  total: number;
  sortOptions: SortOption[];
  sortValue: string;
  isEmpty: boolean;
  isLoading: boolean;
  isReady: boolean;
  hasError: boolean;
  hasLoadedOnce: boolean;
};

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

const DEFAULT_SORT_VALUE = 'relevance';

export const useDerivedListingState = (
  products: Product[],
  total: number,
  status: Status,
  hasLoadedOnce: boolean,
  sortOptions?: ProductSortOption[],
  currentSortValue: string = DEFAULT_SORT_VALUE
): DerivedListingState => {
  return React.useMemo(() => {
    const derivedSortOptions = buildSortOptions(sortOptions);

    return {
      products,
      total,
      sortOptions: derivedSortOptions,
      sortValue: currentSortValue,
      isEmpty: hasLoadedOnce && products.length === 0,
      isLoading: status === 'loading',
      isReady: status === 'ready',
      hasError: status === 'error',
      hasLoadedOnce
    };
  }, [products, total, status, hasLoadedOnce, sortOptions, currentSortValue]);
};

export default useDerivedListingState;
