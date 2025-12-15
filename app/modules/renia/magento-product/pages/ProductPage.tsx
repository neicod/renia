// @env: mixed
import React from 'react';
import {useParams} from 'react-router-dom';
import {readEndpoint} from '../utils/config';
import {useProduct} from '../hooks/useProduct';
import {ProductDetails} from './components/ProductDetails';
import {ProductStatus} from './components/ProductStatus';
import {useI18n} from 'renia-i18n/hooks/useI18n';
import {getLogger} from 'renia-logger';
import type { ProductInterface } from '../types';

const logger = getLogger();

type ProductPageProps = {
  meta?: Record<string, unknown>;
};

export const ProductPage: React.FC<ProductPageProps> = ({ meta }) => {
    const params = useParams();
    const urlKey = params.urlKey ?? params['*'];
    const endpoint = React.useMemo(() => readEndpoint(), []);
    const {t} = useI18n();

    // Use preloaded product from SSR route handler if available
    const preloadedProduct = React.useMemo(
      () => (meta as any)?.product as ProductInterface | undefined,
      [meta]
    );

    const {product: fetchedProduct, status} = useProduct({urlKey: preloadedProduct ? null : urlKey});
    const product = preloadedProduct ?? fetchedProduct;

    // Log state changes (useEffect to avoid render phase side effects)
    React.useEffect(() => {
        if (status === 'error') {
            logger.error('ProductPage', 'Error loading product', {status, urlKey});
        } else if (status === 'ready' && !product) {
            logger.warn('ProductPage', 'Product not found after successful load', {urlKey});
        }
    }, [product, status, urlKey]);

    if (!endpoint) {
        return <ProductStatus tone="muted" message={t('product.error.noEndpoint')}/>;
    }
    if (!urlKey) {
        return <ProductStatus tone="muted" message={t('product.error.noUrlKey')}/>;
    }

    // If product is available, render it (SSR or CSR with data)
    if (product) {
        return <ProductDetails product={product}/>;
    }

    // Handle error state
    if (status === 'error') {
        return <ProductStatus tone="error" message={t('product.error.generic')}/>;
    }

    // Handle product not found (after loading)
    if (status === 'ready') {
        return <ProductStatus tone="error" message={t('product.error.generic')}/>;
    }

    // Loading or idle state - show loading message
    return <ProductStatus tone="info" message={t('product.loading')}/>;
};

export default ProductPage;
