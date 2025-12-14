// @env: mixed
import React from 'react';
import { fetchProduct } from '../services/product';
import type { Product, ProductInterface } from '../types';
import { getLogger } from 'renia-logger';

const logger = getLogger();

export type UseProductOptions = {
  urlKey?: string | null;
};

type Status = 'idle' | 'loading' | 'ready' | 'error';

export const useProduct = ({ urlKey }: UseProductOptions) => {
  const [product, setProduct] = React.useState<ProductInterface | null>(null);
  const [status, setStatus] = React.useState<Status>('idle');

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!urlKey) return;
      logger.info('useProduct', 'Loading product', { urlKey });
      setStatus('loading');
      try {
        const data = await fetchProduct({ urlKey });
        logger.info('useProduct', 'Product fetched', { found: !!data });
        if (!cancelled) {
          setProduct(data);
          setStatus('ready');
          logger.debug('useProduct', 'Product state updated', { status: 'ready' });
        }
      } catch (err) {
        logger.error('useProduct', 'Error fetching product', { urlKey, error: err instanceof Error ? err.message : String(err) });
        if (!cancelled) {
          setStatus('error');
          logger.info('useProduct', 'Status set to error');
        }
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
