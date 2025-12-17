// @env: mixed
import React from 'react';
import type { Product, ProductSortOption } from 'magento-product';
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

/**
 * useDerivedListingState - Derive UI-relevant state from source data
 *
 * Responsibilities:
 * - Compute display flags (isEmpty, isLoading, isReady, hasError)
 * - Transform sort options for UI display
 * - Memoize derivations to prevent unnecessary re-renders
 *
 * Pure derivation logic - no side effects, no API calls
 *
 * @param products - Product list from repository
 * @param total - Total items count from repository
 * @param status - Current status from repository
 * @param hasLoadedOnce - Whether data has loaded at least once
 * @param sortOptions - Raw sort options from API
 * @param currentSortValue - Current sort value
 * @returns Derived state ready for UI consumption
 */
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
