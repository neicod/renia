// @env: mixed
import React from 'react';
import type { ProductSortOption, SortOrder } from 'magento-product';

export type SortOption = { value: string; label: string };

const DEFAULT_SORT_VALUE = 'relevance';

/**
 * makeSortValue - Encode sort field + direction into single string
 * @example makeSortValue('name', 'ASC') → 'name:ASC'
 */
export const makeSortValue = (field: string, direction: 'ASC' | 'DESC' = 'ASC'): string => {
  return `${field}:${direction}`;
};

/**
 * parseSortValue - Decode sort string into field + direction
 * @example parseSortValue('name:DESC') → { field: 'name', direction: 'DESC' }
 */
export const parseSortValue = (
  value: string
): { field: string; direction: 'ASC' | 'DESC' } | null => {
  if (!value || value === DEFAULT_SORT_VALUE) return null;
  const [field, rawDirection] = value.split(':');
  if (!field) return null;
  const direction = rawDirection === 'DESC' ? 'DESC' : 'ASC';
  return { field, direction };
};

/**
 * buildSortOptions - Transform API sort options into UI-friendly format
 * Converts single option into ASC+DESC variants
 * @example
 * Input: [{ value: 'name', label: 'Name' }]
 * Output: [
 *   { value: 'name:ASC', label: 'Name (asc)' },
 *   { value: 'name:DESC', label: 'Name (desc)' }
 * ]
 */
export const buildSortOptions = (options?: ProductSortOption[]): SortOption[] => {
  if (!options?.length) return [];
  return options.flatMap((opt) => {
    if (!opt?.value || !opt?.label) return [];
    return [
      { value: makeSortValue(opt.value, 'ASC'), label: `${opt.label} (asc)` },
      { value: makeSortValue(opt.value, 'DESC'), label: `${opt.label} (desc)` }
    ];
  });
};

/**
 * useSortOptions - Manage sort state and encoding/decoding
 *
 * Responsibilities:
 * - Manage current sort value state
 * - Track if user selected sort (vs default)
 * - Encode/decode sort values
 * - Derive SortOrder[] for GraphQL queries
 *
 * @param initialSortValue - Starting sort value (e.g., 'name:ASC' or 'relevance')
 * @returns Sort state and handlers
 */
export const useSortOptions = (initialSortValue: string = DEFAULT_SORT_VALUE) => {
  const [sort, setSort] = React.useState<string>(initialSortValue);
  const [userSelectedSort, setUserSelectedSort] = React.useState<boolean>(false);

  /**
   * Derive SortOrder[] for GraphQL query
   * Returns undefined if using default/relevance sort (no GraphQL sort param)
   */
  const sortOrders = React.useMemo<SortOrder[] | undefined>(() => {
    const parsed = parseSortValue(sort);
    if (!parsed) return undefined;
    return [{ field: parsed.field, direction: parsed.direction }];
  }, [sort]);

  const handleSortChange = React.useCallback((value: string) => {
    setUserSelectedSort(true);
    setSort(value);
  }, []);

  const handleResetSort = React.useCallback(() => {
    setUserSelectedSort(false);
    setSort(initialSortValue);
  }, [initialSortValue]);

  return {
    sort,
    setSort,
    sortOrders,
    userSelectedSort,
    handleSortChange,
    handleResetSort
  };
};

export default useSortOptions;
