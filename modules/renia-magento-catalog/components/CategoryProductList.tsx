// @env: mixed
import React from 'react';
import { ProductList } from 'magento-product/components/ProductList';
import { ProductRepository } from 'magento-product';
import type { ProductSortOption } from 'magento-product';
import type { SearchCriteria, SortOrder } from '@framework/api';
import { ProductListingToolbar } from './ProductListingToolbar';
import { ProductListingPagination } from './ProductListingPagination';

type Props = {
  meta?: Record<string, unknown>;
};

const PAGE_SIZE = 12;
const FALLBACK_SORT_OPTIONS: { value: string; label: string }[] = [
  { value: 'relevance', label: 'Sort by relevance' },
  { value: 'price:ASC', label: 'Price: low to high' },
  { value: 'price:DESC', label: 'Price: high to low' },
  { value: 'name:ASC', label: 'Name: A-Z' },
  { value: 'name:DESC', label: 'Name: Z-A' }
];

const makeSortValue = (field: string, direction: 'ASC' | 'DESC') => `${field}:${direction}`;
const buildSortOptions = (options?: ProductSortOption[]) => {
  if (!options?.length) return FALLBACK_SORT_OPTIONS;
  return options.flatMap((opt) => {
    if (!opt?.value || !opt?.label) return [];
    return [
      { value: makeSortValue(opt.value, 'ASC'), label: `${opt.label} (asc)` },
      { value: makeSortValue(opt.value, 'DESC'), label: `${opt.label} (desc)` }
    ];
  });
};

export const CategoryProductList: React.FC<Props> = ({ meta }) => {
  const env = typeof window === 'undefined' ? 'ssr' : 'client';
  const repo = React.useMemo(() => {
    try {
      const instance = new ProductRepository();
      console.info('[CategoryProductList] Repo initialized', { env });
      return instance;
    } catch (err) {
      console.error('[CategoryProductList] Failed to init ProductRepository', err);
      return null;
    }
  }, []);

  const category = React.useMemo(() => (meta as any)?.category, [meta]);
  const categoryUid = typeof category?.id === 'string' ? category.id : undefined;

  console.info('[CategoryProductList] Render', {
    env,
    hasRepo: Boolean(repo),
    categoryUid
  });

  const [products, setProducts] = React.useState<any[]>([]);
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'ready' | 'error' | 'empty'>(
    'idle'
  );
  const [sort, setSort] = React.useState<string>(FALLBACK_SORT_OPTIONS[0].value);
  const [sortOptions, setSortOptions] = React.useState<{ value: string; label: string }[]>(
    FALLBACK_SORT_OPTIONS
  );
  const [userSelectedSort, setUserSelectedSort] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [total, setTotal] = React.useState<number>(0);

  React.useEffect(() => {
    console.info('[CategoryProductList] Mounted', { env, hasRepo: Boolean(repo), categoryUid });
  }, [env, repo, categoryUid]);

  React.useEffect(() => {
    setPage(1);
    setUserSelectedSort(false);
  }, [categoryUid]);

  const sortOrders = React.useMemo<SortOrder[] | undefined>(() => {
    if (!sort || sort === 'relevance') return undefined;
    const [field, rawDirection] = sort.split(':');
    if (!field) return undefined;
    const direction = rawDirection === 'DESC' ? 'DESC' : 'ASC';
    return [{ field, direction }];
  }, [sort]);

  const criteria = React.useMemo<SearchCriteria | null>(() => {
    if (!categoryUid) return null;
    const built: SearchCriteria = {
      filterGroups: [{ filters: [{ field: 'category_uid', value: categoryUid }] }],
      pageSize: PAGE_SIZE,
      currentPage: page,
      sortOrders
    };
    console.info('[CategoryProductList] Built criteria', { env, built, sort });
    return built;
  }, [categoryUid, env, page, sort, sortOrders]);

  React.useEffect(() => {
    let cancelled = false;
    if (!criteria || !repo) {
      console.info('[CategoryProductList] Skipping fetch – missing criteria or repo', {
        env,
        hasCriteria: Boolean(criteria),
        hasRepo: Boolean(repo)
      });
      setProducts([]);
      setTotal(0);
      setStatus('idle');
      return undefined;
    }

    const run = async () => {
      console.info('[CategoryProductList] Fetch start', { env, criteria });
      setStatus('loading');
      try {
        const res = await repo.getList(criteria);
        console.info('[CategoryProductList] Fetch success', { env, res });
        if (!cancelled) {
          setProducts(res.items ?? []);
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
              : apiSortOptions[0]?.value ?? FALLBACK_SORT_OPTIONS[0].value;
            const nextSort = preferred ?? fallbackPreferred;
            if (nextSort && nextSort !== sort) {
              setSort(nextSort);
            }
          }
          setStatus(res.items.length ? 'ready' : 'empty');
        }
      } catch (err) {
        console.error('[CategoryProductList] Failed to fetch category products', { env, err });
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
  }, [criteria, repo, sort, userSelectedSort]);

  if (!categoryUid || !repo) return null;

  const totalPages = Math.max(1, Math.ceil(Math.max(total, 0) / PAGE_SIZE));
  const handleSortChange = (value: string) => {
    setUserSelectedSort(true);
    setSort(value);
    setPage(1);
  };
  const handlePageChange = (next: number) => {
    const safe = Math.min(Math.max(next, 1), totalPages);
    setPage(safe);
  };
  const controlsDisabled = status === 'loading';

  return (
    <div>
      <ProductListingToolbar
        sortOptions={sortOptions}
        value={sort}
        onChange={handleSortChange}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        disabled={controlsDisabled}
      />
      <ProductList
        products={products}
        loading={status === 'loading'}
        error={status === 'error' ? 'Failed to fetch products' : null}
        emptyLabel="No products in this category"
      />
      <ProductListingPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={handlePageChange}
        disabled={controlsDisabled}
      />
    </div>
  );
};

export default CategoryProductList;
