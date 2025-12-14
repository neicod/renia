// @env: mixed
import React from 'react';
import {useParams} from 'react-router-dom';
import {readEndpoint} from '../utils/config';
import {useProduct} from '../hooks/useProduct';
import {ProductDetails} from './components/ProductDetails';
import {ProductStatus} from './components/ProductStatus';
import {useI18n} from 'renia-i18n/hooks/useI18n';
import {getLogger} from 'renia-logger';

const logger = getLogger();

export const ProductPage: React.FC = () => {
    const params = useParams();
    const urlKey = params.urlKey ?? params['*'];
    const endpoint = React.useMemo(() => readEndpoint(), []);
    const {t} = useI18n();
    const {product, status} = useProduct({urlKey});

    // Log state changes (useEffect to avoid render phase side effects)
    React.useEffect(() => {
        if (product) {
            logger.debug('ProductPage', 'Rendering ProductDetails', {urlKey, status, productId: product.id});
        } else if (status === 'error') {
            logger.error('ProductPage', 'Error loading product', {status, urlKey});
        } else if (status === 'ready') {
            logger.warn('ProductPage', 'Product not found after successful load', {urlKey});
        } else {
            logger.debug('ProductPage', 'Waiting for product data', {status, urlKey});
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
