// @env: mixed
import React from 'react';
import { fetchProduct } from '../services/product';
import type { Product } from '../types';

export type UseProductOptions = {
  urlKey?: string | null;
};

type Status = 'idle' | 'loading' | 'ready' | 'error';

export const useProduct = ({ urlKey }: UseProductOptions) => {
  const [product, setProduct] = React.useState<Product | null>(null);
  const [status, setStatus] = React.useState<Status>('idle');

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!urlKey) return;
      setStatus('loading');
      try {
        const data = await fetchProduct({ urlKey });
        if (!cancelled) {
          setProduct(data);
          setStatus('ready');
        }
      } catch (err) {
        console.error('Error fetching product', err);
        if (!cancelled) setStatus('error');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [urlKey]);

  return { product, status };
};

export default useProduct;
