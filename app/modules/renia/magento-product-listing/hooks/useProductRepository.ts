// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@framework/api';
import { productRepository } from 'renia-magento-product';
import type {
  ProductRepository as ProductRepositoryService,
  ProductSearchResults,
  Product
} from 'renia-magento-product';
import { useAppEnvironment } from '@framework/runtime/AppEnvContext';

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

export type ProductSearchState = {
  products: Product[];
  total: number;
  status: Status;
  hasLoadedOnce: boolean;
};

export const useProductRepository = (initialListing?: ProductSearchResults | null) => {
  const { runtime } = useAppEnvironment();
  const repo = React.useMemo<ProductRepositoryService>(() => productRepository, []);

  const [products, setProducts] = React.useState<Product[]>(initialListing?.items ?? []);
  const [total, setTotal] = React.useState<number>(initialListing?.totalCount ?? 0);
  const initialStatus: Status =
    initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'loading');
  const [status, setStatusRaw] = React.useState<Status>(initialStatus);
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState<boolean>(!!initialListing);

  const setStatus = (newStatus: Status) => {
    setStatusRaw(newStatus);
  };

  const lastCriteriaRef = React.useRef<SearchCriteria | null>(null);

  const fetchProducts = React.useCallback(
    (criteria: SearchCriteria | null) => {
      if (!criteria || !repo) {
        setStatus('idle');
        setProducts([]);
        setTotal(0);
        setHasLoadedOnce(false);
        lastCriteriaRef.current = null;
        return () => {};
      }

      const lastCriteria = lastCriteriaRef.current;
      if (lastCriteria && JSON.stringify(lastCriteria) === JSON.stringify(criteria)) {
        return () => {};
      }

      lastCriteriaRef.current = criteria;

      let cancelled = false;
      setStatus('loading');

      repo.getList(criteria)
        .then((res) => {
          if (!cancelled) {
            const items = res.items ?? [];
            setProducts(items);
            setHasLoadedOnce(true);
            setTotal(res.totalCount ?? 0);
            setStatus(items.length ? 'ready' : 'empty');
          }
        })
        .catch((err) => {
          console.error('[useProductRepository] Failed to fetch products', { runtime, err });
          if (!cancelled) {
            setStatus('error');
            setTotal(0);
          }
        });

      return () => {
        cancelled = true;
      };
    },
    [repo, runtime]
  );

  return React.useMemo(
    () => ({
      products,
      total,
      status,
      hasLoadedOnce,
      fetchProducts
    }),
    [products, total, status, hasLoadedOnce, fetchProducts]
  );
};

export default useProductRepository;
