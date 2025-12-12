// @env: mixed
import React from 'react';
import { productRepository } from 'magento-product';
import type { ProductRepository as ProductRepositoryService, ProductSortOption } from 'magento-product';
import type { SearchCriteria, SortOrder } from '@framework/api';
import { fetchStorefrontPageSizeConfig } from '../services/storefrontConfig';

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';
type SortOption = { value: string; label: string };

const DEFAULT_PAGE_SIZE = 12;
const DEFAULT_SORT_VALUE = 'relevance';

const makeSortValue = (field: string, direction: 'ASC' | 'DESC') => `${field}:${direction}`;
const buildSortOptions = (options?: ProductSortOption[]): SortOption[] => {
  if (!options?.length) return [];
  return options.flatMap((opt) => {
    if (!opt?.value || !opt?.label) return [];
    return [
      { value: makeSortValue(opt.value, 'ASC'), label: `${opt.label} (asc)` },
      { value: makeSortValue(opt.value, 'DESC'), label: `${opt.label} (desc)` }
    ];
  });
};

const normalizePageSize = (value: number) => {
  if (!Number.isFinite(value)) return DEFAULT_PAGE_SIZE;
  return Math.max(1, Math.floor(value));
};

type UseStorefrontPageSizeArgs = {
  env: 'ssr' | 'client';
  categoryUid?: string;
};

const useStorefrontPageSize = ({ env, categoryUid }: UseStorefrontPageSizeArgs) => {
  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const [pageSizeOptions, setPageSizeOptions] = React.useState<number[]>([DEFAULT_PAGE_SIZE]);
  const [defaultPageSize, setDefaultPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);
  const userSelectedRef = React.useRef(false);
  const defaultPageSizeRef = React.useRef(defaultPageSize);

  React.useEffect(() => {
    defaultPageSizeRef.current = defaultPageSize;
  }, [defaultPageSize]);

  React.useEffect(() => {
    let cancelled = false;

    const loadStorefrontConfig = async () => {
      try {
        const config = await fetchStorefrontPageSizeConfig();
        if (cancelled) return;

        const allowedOptions =
          config.gridPerPageValues.length > 0
            ? config.gridPerPageValues
            : config.defaultGridPerPage
              ? [config.defaultGridPerPage]
              : [DEFAULT_PAGE_SIZE];

        const fallbackDefault =
          config.defaultGridPerPage ?? allowedOptions[0] ?? DEFAULT_PAGE_SIZE;

        setPageSizeOptions(allowedOptions);
        setDefaultPageSize(fallbackDefault);
        if (!userSelectedRef.current) {
          setPageSize(fallbackDefault);
        }
      } catch (error) {
        console.warn('[useCategoryProductList] Failed to load store config', { env, error });
        if (cancelled) return;

        setPageSizeOptions((prev) => (prev.length ? prev : [DEFAULT_PAGE_SIZE]));
        setDefaultPageSize((prev) => prev ?? DEFAULT_PAGE_SIZE);
        if (!userSelectedRef.current) {
          setPageSize((prev) => prev || DEFAULT_PAGE_SIZE);
        }
      }
    };

    loadStorefrontConfig();
    return () => {
      cancelled = true;
    };
  }, [env]);

  React.useEffect(() => {
    if (!userSelectedRef.current) {
      setPageSize(defaultPageSize);
    }
  }, [defaultPageSize]);

  React.useEffect(() => {
    userSelectedRef.current = false;
    setPageSize(defaultPageSizeRef.current);
  }, [categoryUid]);

  const setUserPageSize = React.useCallback((value: number) => {
    const normalized = normalizePageSize(value);
    userSelectedRef.current = true;
    setPageSize(normalized);
    return normalized;
  }, []);

  return {
    pageSize,
    pageSizeOptions,
    setUserPageSize
  };
};

type UseCategoryProductListArgs = {
  env: 'ssr' | 'client';
  categoryUid?: string;
};

export const useCategoryProductList = ({ env, categoryUid }: UseCategoryProductListArgs) => {
  const repo = React.useMemo<ProductRepositoryService>(() => productRepository, []);
  const hasRepo = Boolean(repo);
  const { pageSize, pageSizeOptions, setUserPageSize } = useStorefrontPageSize({
    env,
    categoryUid
  });

  const [products, setProducts] = React.useState<any[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<Status>('idle');
  const [sort, setSort] = React.useState<string>(DEFAULT_SORT_VALUE);
  const [sortOptions, setSortOptions] = React.useState<SortOption[]>([]);
  const [userSelectedSort, setUserSelectedSort] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [total, setTotal] = React.useState<number>(0);

  React.useEffect(() => {
    console.info('[useCategoryProductList] Mounted/updated', {
      env,
      hasRepo,
      categoryUid
    });
  }, [env, hasRepo, categoryUid]);

  React.useEffect(() => {
    setPage(1);
    setUserSelectedSort(false);
    setProducts([]);
    setHasLoadedOnce(false);
  }, [categoryUid]);

  const sortOrders = React.useMemo<SortOrder[] | undefined>(() => {
    if (!sort || sort === DEFAULT_SORT_VALUE) return undefined;
    const [field, rawDirection] = sort.split(':');
    if (!field) return undefined;
    const direction = rawDirection === 'DESC' ? 'DESC' : 'ASC';
    return [{ field, direction }];
  }, [sort]);

  const criteria = React.useMemo<SearchCriteria | null>(() => {
    if (!categoryUid) return null;
    const built: SearchCriteria = {
      filterGroups: [{ filters: [{ field: 'category_uid', value: categoryUid }] }],
      pageSize,
      currentPage: page,
      sortOrders
    };
    console.info('[useCategoryProductList] Built criteria', { env, built, sort, pageSize });
    return built;
  }, [categoryUid, env, page, pageSize, sort, sortOrders]);

  React.useEffect(() => {
    let cancelled = false;
    if (!criteria || !repo) {
      console.info('[useCategoryProductList] Skipping fetch – missing criteria or repo', {
        env,
        hasCriteria: Boolean(criteria),
        hasRepo: Boolean(repo)
      });
      setProducts([]);
      setTotal(0);
      setStatus('idle');
      setHasLoadedOnce(false);
      return () => undefined;
    }

    const run = async () => {
      console.info('[useCategoryProductList] Fetch start', { env, criteria });
      setStatus('loading');
      try {
        const res = await repo.getList(criteria);
        console.info('[useCategoryProductList] Fetch success', { env, res });
        if (!cancelled) {
          const items = res.items ?? [];
          setProducts(items);
          setHasLoadedOnce(true);
          setTotal(res.totalCount ?? 0);
          const apiSortOptions = buildSortOptions(res.sortOptions);
          setSortOptions(apiSortOptions);
          if (!userSelectedSort) {
            const preferred =
              res.defaultSort && res.defaultSort.length
                ? makeSortValue(res.defaultSort, 'ASC')
                : undefined;
            const fallbackPreferred = apiSortOptions.find((o) => o.value === sort)
              ? sort
              : apiSortOptions[0]?.value ?? DEFAULT_SORT_VALUE;
            const nextSort = preferred ?? fallbackPreferred;
            if (nextSort && nextSort !== sort) {
              setSort(nextSort);
            }
          }
          setStatus(items.length ? 'ready' : 'empty');
        }
      } catch (err) {
        console.error('[useCategoryProductList] Failed to fetch category products', { env, err });
        if (!cancelled) {
          setStatus('error');
          setTotal(0);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [criteria, env, repo, sort, userSelectedSort]);

  const pageSizeSafe = Math.max(pageSize, 1);
  const handleSortChange = React.useCallback((value: string) => {
    setUserSelectedSort(true);
    setSort(value);
    setPage(1);
  }, []);

  const handlePageSizeChange = React.useCallback(
    (value: number) => {
      setUserPageSize(value);
      setPage(1);
    },
    [setUserPageSize]
  );

  const handlePageChange = React.useCallback(
    (next: number) => {
      const totalPages = Math.max(1, Math.ceil(Math.max(total, 0) / pageSizeSafe));
      const safe = Math.min(Math.max(next, 1), totalPages);
      setPage(safe);
    },
    [pageSizeSafe, total]
  );

  const isInitialLoading = status === 'loading' && !hasLoadedOnce;

  return {
    hasRepo,
    products,
    total,
    status,
    isInitialLoading,
    sort,
    sortOptions,
    page,
    pageSize: pageSizeSafe,
    pageSizeOptions,
    handleSortChange,
    handlePageSizeChange,
    handlePageChange
  };
};

export default useCategoryProductList;
