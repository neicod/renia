// @env: mixed
import React from 'react';
import { fetchProduct } from '../services/product.js';
import { getLogger } from 'renia-logger';
const logger = getLogger();
export const useProduct = ({ urlKey }) => {
    const [product, setProduct] = React.useState(null);
    const [status, setStatus] = React.useState('idle');
    React.useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!urlKey)
                return;
            setStatus('loading');
            try {
                const data = await fetchProduct({ urlKey });
                if (!cancelled) {
                    setProduct(data);
                    setStatus('ready');
                }
            }
            catch (err) {
                logger.error('useProduct', 'Error fetching product', { urlKey, error: err instanceof Error ? err.message : String(err) });
                if (!cancelled) {
                    setStatus('error');
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
