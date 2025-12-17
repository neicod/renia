// @env: mixed
import React from 'react';
import type { SearchCriteria, SortOrder } from '@framework/api';
import { productRepository } from 'magento-product';
import type {
  ProductRepository as ProductRepositoryService,
  ProductSearchResults,
  Product
} from 'magento-product';
import { useAppEnvironment } from '@framework/runtime/AppEnvContext';

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

export type ProductSearchState = {
  products: Product[];
  total: number;
  status: Status;
  hasLoadedOnce: boolean;
};

/**
 * useProductRepository - Handle GraphQL product search + error handling
 *
 * Responsibilities:
 * - Execute GraphQL product list queries
 * - Manage loading/error/ready states
 * - Track if data has loaded at least once
 * - Handle cancellation on unmount
 *
 * @param initialListing - SSR preloaded data (optional)
 * @returns Current search state + fetch function
 */
export const useProductRepository = (
  initialListing?: ProductSearchResults | null
) => {
  const { runtime } = useAppEnvironment();
  const repo = React.useMemo<ProductRepositoryService>(() => productRepository, []);

  // Initialize state from SSR data
  const [products, setProducts] = React.useState<Product[]>(initialListing?.items ?? []);
  const [total, setTotal] = React.useState<number>(initialListing?.totalCount ?? 0);
  const [status, setStatus] = React.useState<Status>(
    initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'idle')
  );
  const [hasLoadedOnce, setHasLoadedOnce] = React.useState<boolean>(!!initialListing);

  /**
   * Execute product search with given criteria
   * Updates state and handles errors/cancellation
   */
  const fetchProducts = React.useCallback(
    (criteria: SearchCriteria | null) => {
      // No criteria = reset to idle state
      if (!criteria || !repo) {
        setStatus('idle');
        setProducts([]);
        setTotal(0);
        setHasLoadedOnce(false);
        return () => {};
      }

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

      // Return cleanup function
      return () => {
        cancelled = true;
      };
    },
    [repo, runtime]
  );

  return {
    products,
    total,
    status,
    hasLoadedOnce,
    fetchProducts
  };
};

export default useProductRepository;
