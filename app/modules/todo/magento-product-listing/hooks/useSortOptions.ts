// @env: mixed
import React from 'react';
import type { ProductSortOption } from 'renia-magento-product';
import type { SortOrder } from '@renia/framework/api';

export type SortOption = { value: string; label: string };

const DEFAULT_SORT_VALUE = 'relevance';

export const makeSortValue = (field: string, direction: 'ASC' | 'DESC' = 'ASC'): string => {
  return `${field}:${direction}`;
};

export const parseSortValue = (
  value: string
): { field: string; direction: 'ASC' | 'DESC' } | null => {
  if (!value || value === DEFAULT_SORT_VALUE) return null;
  const [field, rawDirection] = value.split(':');
  if (!field) return null;
  const direction = rawDirection === 'DESC' ? 'DESC' : 'ASC';
  return { field, direction };
};

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

export const useSortOptions = (initialSortValue: string = DEFAULT_SORT_VALUE) => {
  const [sort, setSort] = React.useState<string>(initialSortValue);
  const [userSelectedSort, setUserSelectedSort] = React.useState<boolean>(false);

  const sortOrders = React.useMemo<SortOrder[] | undefined>(() => {
    const parsed = parseSortValue(sort);
    if (!parsed) return undefined;
    return [{ field: parsed.field, direction: parsed.direction }];
  }, [sort]);

  const setSortValue = React.useCallback((value: string, options?: { user?: boolean }) => {
    const isUser = options?.user !== false;
    setUserSelectedSort(isUser);
    setSort(value);
  }, []);

  const handleSortChange = React.useCallback((value: string) => {
    setSortValue(value, { user: true });
  }, [setSortValue]);

  const handleResetSort = React.useCallback(() => {
    setUserSelectedSort(false);
    setSort(initialSortValue);
  }, [initialSortValue]);

  return React.useMemo(
    () => ({
      sort,
      sortOrders,
      userSelectedSort,
      setSortValue,
      handleSortChange,
      handleResetSort
    }),
    [sort, sortOrders, userSelectedSort, setSortValue, handleSortChange, handleResetSort]
  );
};

export default useSortOptions;
