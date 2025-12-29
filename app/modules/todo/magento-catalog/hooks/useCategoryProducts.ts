// @env: mixed
import React from 'react';
import { fetchCategoryUid } from '../services/categoryUid';
import { fetchCategoryProducts } from '../services/categoryProducts';
import type { Product } from 'renia-magento-product/types';

type UseCategoryProductsOptions = {
  endpoint?: string;
  categoryPath?: string;
  categoryUid?: string;
};

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'empty';

export const useCategoryProducts = ({ endpoint, categoryPath, categoryUid }: UseCategoryProductsOptions) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [status, setStatus] = React.useState<Status>('idle');
  const [resolvedUid, setResolvedUid] = React.useState<string | undefined>(categoryUid);
  const fetchingRef = React.useRef(false);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const path = categoryPath;
      if (!endpoint || (!path && !resolvedUid)) return;
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setStatus('loading');
      try {
        let uid = resolvedUid;
        if (!uid && path) {
          uid = await fetchCategoryUid({ endpoint, urlPath: path });
          if (!cancelled) setResolvedUid(uid ?? undefined);
        }

        if (!uid) {
          if (!cancelled) setStatus('empty');
          fetchingRef.current = false;
          return;
        }

        const res = await fetchCategoryProducts({
          endpoint,
          categoryUid: uid,
          page: 1,
          pageSize: 12
        });
        if (!cancelled) {
          setProducts(res.items);
          setStatus(res.items.length ? 'ready' : 'empty');
        }
      } catch (err) {
        console.error('Error fetching category products', err);
        if (!cancelled) setStatus('error');
      }
      fetchingRef.current = false;
    };
    run();
    return () => {
      cancelled = true;
      fetchingRef.current = false;
    };
  }, [endpoint, categoryPath, resolvedUid]);

  return {
    products,
    status,
    setResolvedUid
  };
};

export default useCategoryProducts;
