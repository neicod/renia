// @env: mixed
import React from 'react';
import type { SearchCriteria } from '@renia/framework/api';
import { productRepository } from 'renia-magento-product';
import type {
  ProductRepository as ProductRepositoryService,
  ProductSearchResults,
  Product
} from 'renia-magento-product';
import { useAppEnvironment } from '@renia/framework/runtime/AppEnvContext';
import { getGlobalTtlCache } from '@renia/framework/runtime/cache/ttlCache';

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

export type ProductSearchState = {
  products: Product[];
  total: number;
  status: Status;
  hasLoadedOnce: boolean;
};

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

export const useProductRepository = (
  initialListing?: ProductSearchResults | null,
  resetKey?: string
) => {
  const { runtime, storeCode } = useAppEnvironment();
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
  const seededFromInitialListingRef = React.useRef<boolean>(false);
  const prevResetKeyRef = React.useRef<string | undefined>(resetKey);
  const inFlightCriteriaJsonRef = React.useRef<string | null>(null);
  const requestSeqRef = React.useRef<number>(0);

  const initialListingCriteriaJson = React.useMemo(() => {
    const criteria = initialListing?.searchCriteria;
    if (!criteria) return null;
    try {
      return JSON.stringify(criteria);
    } catch {
      return null;
    }
  }, [initialListing]);

  const listingCache = React.useMemo(() => {
    // Client-only caching: improves back/forward and category->category navigation without affecting SSR correctness.
    if (runtime !== 'client') return null;
    return getGlobalTtlCache<ProductSearchResults>('productListing.client', {
      ttlMs: 30_000,
      maxEntries: 200
    });
  }, [runtime]);

  const makeCacheKey = React.useCallback(
    (criteria: SearchCriteria) => {
      const storeKey = storeCode ? String(storeCode) : 'default';
      return `${storeKey}::${JSON.stringify(criteria)}`;
    },
    [storeCode]
  );

  useIsomorphicLayoutEffect(() => {
    seededFromInitialListingRef.current = false;
    lastCriteriaRef.current = null;

    if (initialListing) {
      const items = initialListing?.items ?? [];
      setProducts(items);
      setTotal(initialListing?.totalCount ?? 0);
      setHasLoadedOnce(true);
      setStatus(items.length ? 'ready' : 'empty');
      prevResetKeyRef.current = resetKey;
      return;
    }

    const prev = prevResetKeyRef.current;
    const isResetChange =
      typeof resetKey === 'string' &&
      typeof prev === 'string' &&
      resetKey !== prev;
    prevResetKeyRef.current = resetKey;

    // On key changes (e.g. category -> category), keep previous items while loading the new listing.
    if (resetKey && isResetChange) {
      setStatus('loading');
      return;
    }

    // Initial load or reset to empty: clear state.
    const items = initialListing?.items ?? [];
    setProducts(items);
    setTotal(initialListing?.totalCount ?? 0);
    setHasLoadedOnce(!!initialListing);

    if (resetKey) {
      setStatus('loading');
      return;
    }

    setStatus('idle');
  }, [resetKey, initialListing]);

  const fetchProducts = React.useCallback(
    (criteria: SearchCriteria | null) => {
      if (!criteria || !repo) {
        if (resetKey) {
          // During route transitions we may temporarily have no criteria (e.g. waiting for category UID).
          // Keep current listing visible and show background loading.
          setStatus('loading');
          lastCriteriaRef.current = null;
          return () => {};
        }

        setStatus('idle');
        setProducts([]);
        setTotal(0);
        setHasLoadedOnce(false);
        lastCriteriaRef.current = null;
        return () => {};
      }

      const criteriaJson = (() => {
        try {
          return JSON.stringify(criteria);
        } catch {
          return null;
        }
      })();

      if (initialListingCriteriaJson && criteriaJson && initialListingCriteriaJson === criteriaJson) {
        // Criteria matches SSR/page-context listing; skip network fetch.
        seededFromInitialListingRef.current = true;
        lastCriteriaRef.current = criteria;
        return () => {};
      }

      const lastCriteria = lastCriteriaRef.current;
      if (lastCriteria && JSON.stringify(lastCriteria) === JSON.stringify(criteria)) {
        return () => {};
      }

      // SSR already delivered initial listing for the current criteria; avoid immediate refetch on hydration.
      if (initialListing && !seededFromInitialListingRef.current) {
        seededFromInitialListingRef.current = true;
        lastCriteriaRef.current = criteria;
        return () => {};
      }

      if (criteriaJson && inFlightCriteriaJsonRef.current === criteriaJson) {
        return () => {};
      }

      const cacheKey = listingCache ? makeCacheKey(criteria) : null;
      if (listingCache && cacheKey) {
        const cached = listingCache.get(cacheKey);
        if (cached) {
          lastCriteriaRef.current = criteria;
          const items = cached.items ?? [];
          setProducts(items);
          setHasLoadedOnce(true);
          setTotal(cached.totalCount ?? 0);
          setStatus(items.length ? 'ready' : 'empty');
          return () => {};
        }
      }

      lastCriteriaRef.current = criteria;
      if (criteriaJson) {
        inFlightCriteriaJsonRef.current = criteriaJson;
      }

      const requestId = ++requestSeqRef.current;
      setStatus('loading');

      repo.getList(criteria)
        .then((res) => {
          if (requestId !== requestSeqRef.current) return;
          if (criteriaJson && inFlightCriteriaJsonRef.current === criteriaJson) {
            inFlightCriteriaJsonRef.current = null;
          }
          const items = res.items ?? [];
          if (listingCache && cacheKey) {
            listingCache.set(cacheKey, res);
          }
          setProducts(items);
          setHasLoadedOnce(true);
          setTotal(res.totalCount ?? 0);
          setStatus(items.length ? 'ready' : 'empty');
        })
        .catch((err) => {
          if (requestId !== requestSeqRef.current) return;
          if (criteriaJson && inFlightCriteriaJsonRef.current === criteriaJson) {
            inFlightCriteriaJsonRef.current = null;
          }
          console.error('[useProductRepository] Failed to fetch products', { runtime, err });
          setStatus('error');
          setTotal(0);
        });

      return () => {};
    },
    [repo, initialListing, resetKey, listingCache, makeCacheKey]
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
