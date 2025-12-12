// @env: mixed
import React from 'react';
import type { SearchCriteria, SortOrder } from '@framework/api';
import { productRepository } from 'magento-product';
import type {
  ProductRepository as ProductRepositoryService,
  ProductSearchResults,
  ProductSortOption
} from 'magento-product';
import type { Product } from 'magento-product';
import { useStorefrontPageSize } from './useStorefrontPageSize';

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';
type SortOption = { value: string; label: string };

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

type DerivedListingState = {
  products: Product[];
  total: number;
  sortOptions: SortOption[];
  sortValue: string;
  status: Status;
  hasLoadedOnce: boolean;
  page: number;
};

const deriveListingState = (listing?: ProductSearchResults | null): DerivedListingState => {
  const items = listing?.items ?? [];
  const total = listing?.totalCount ?? 0;
  const sortOptions = buildSortOptions(listing?.sortOptions);
  const sortValue =
    listing?.defaultSort && listing.defaultSort.length
      ? makeSortValue(listing.defaultSort, 'ASC')
      : DEFAULT_SORT_VALUE;
  let status: Status = 'idle';
  let hasLoadedOnce = false;
  let page = listing?.searchCriteria?.currentPage ?? 1;

  if (listing) {
    hasLoadedOnce = true;
    status = items.length ? 'ready' : 'empty';
  }

  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }

  return {
    products: items,
    total,
    sortOptions,
    sortValue,
    status,
    hasLoadedOnce,
    page
  };
};

type CriteriaBuilderArgs = {
  page: number;
  pageSize: number;
  sortOrders?: SortOrder[];
};

type UseProductListingArgs = {
  env: 'ssr' | 'client';
  initialListing?: ProductSearchResults | null;
  buildCriteria: (args: CriteriaBuilderArgs) => SearchCriteria | null;
  resetKey?: string;
};

export const useProductListing = ({
  env,
  initialListing,
  buildCriteria,
  resetKey
}: UseProductListingArgs) => {
  const repo = React.useMemo<ProductRepositoryService>(() => productRepository, []);
  const { pageSize, pageSizeOptions, setUserPageSize } = useStorefrontPageSize({
    env,
    resetKey
  });

  const listingStateRef = React.useRef<DerivedListingState | null>(null);
  if (!listingStateRef.current) {
    listingStateRef.current = deriveListingState(initialListing);
  }
  const initialState = listingStateRef.current;

  const [products, setProducts] = React.useState<Product[]>(initialState.products);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState<boolean>(initialState.hasLoadedOnce);
  const [status, setStatus] = React.useState<Status>(initialState.status);
  const [sort, setSort] = React.useState<string>(initialState.sortValue);
  const [sortOptions, setSortOptions] = React.useState<SortOption[]>(initialState.sortOptions);
  const [userSelectedSort, setUserSelectedSort] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(initialState.page);
  const [total, setTotal] = React.useState<number>(initialState.total);

  const previousResetKeyRef = React.useRef<string | undefined>(resetKey);

  React.useEffect(() => {
    if (previousResetKeyRef.current === resetKey) {
      return;
    }
    previousResetKeyRef.current = resetKey;
    const derived = deriveListingState(initialListing);
    listingStateRef.current = derived;
    setPage(derived.page);
    setUserSelectedSort(false);
    setProducts(derived.products);
    setTotal(derived.total);
    setSortOptions(derived.sortOptions);
    setSort(derived.sortValue);
    setHasLoadedOnce(derived.hasLoadedOnce);
    setStatus(derived.status);
  }, [initialListing, resetKey]);

  const sortOrders = React.useMemo<SortOrder[] | undefined>(() => {
    if (!sort || sort === DEFAULT_SORT_VALUE) return undefined;
    const [field, rawDirection] = sort.split(':');
    if (!field) return undefined;
    const direction = rawDirection === 'DESC' ? 'DESC' : 'ASC';
    return [{ field, direction }];
  }, [sort]);

  const criteria = React.useMemo<SearchCriteria | null>(() => {
    return buildCriteria({
      page,
      pageSize,
      sortOrders
    });
  }, [buildCriteria, page, pageSize, sortOrders]);

  React.useEffect(() => {
    let cancelled = false;
    if (!criteria || !repo) {
      setStatus('idle');
      if (!criteria) {
        setProducts([]);
        setTotal(0);
        setHasLoadedOnce(false);
      }
      return () => undefined;
    }

    const run = async () => {
      setStatus('loading');
      try {
        const res = await repo.getList(criteria);
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
        console.error('[useProductListing] Failed to fetch products', { env, err });
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
    status,
    isInitialLoading,
    listing: {
      products,
      total,
      sort,
      sortOptions,
      page: page,
      pageSize: pageSizeSafe,
      pageSizeOptions
    },
    handlers: {
      onSortChange: handleSortChange,
      onItemsPerPageChange: handlePageSizeChange,
      onPageChange: handlePageChange
    }
  };
};

export default useProductListing;
