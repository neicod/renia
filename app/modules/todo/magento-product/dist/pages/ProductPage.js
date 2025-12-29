import { jsx as _jsx } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
import { useLocation } from 'react-router-dom';
import { readEndpoint } from '../utils/config.js';
import { useProduct } from '../hooks/useProduct.js';
import { ProductDetails } from './components/ProductDetails.js';
import { ProductStatus } from './components/ProductStatus.js';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { getLogger } from 'renia-logger';
const logger = getLogger();
const extractUrlKeyFromPathname = (pathname) => {
    const trimmed = (pathname ?? '').replace(/^\/+|\/+$/g, '');
    if (!trimmed)
        return null;
    const last = trimmed.split('/').filter(Boolean).pop() ?? trimmed;
    return last.endsWith('.html') ? last.slice(0, -5) : last;
};
export const ProductPage = ({ meta }) => {
    const location = useLocation();
    const urlKey = React.useMemo(() => {
        const fromMeta = typeof meta?.productUrlKey === 'string' ? String(meta.productUrlKey) : null;
        const fromProduct = typeof meta?.product?.urlKey === 'string' ? String(meta.product.urlKey) : null;
        return fromMeta ?? fromProduct ?? extractUrlKeyFromPathname(location.pathname);
    }, [location.pathname, meta]);
    const endpoint = React.useMemo(() => readEndpoint(), []);
    const { t } = useI18n();
    // Use preloaded product from SSR route handler if available
    const preloadedProduct = React.useMemo(() => meta?.product, [meta]);
    const { product: fetchedProduct, status } = useProduct({ urlKey: preloadedProduct ? null : urlKey });
    const product = preloadedProduct ?? fetchedProduct;
    // Log state changes (useEffect to avoid render phase side effects)
    React.useEffect(() => {
        if (status === 'error') {
            logger.error('ProductPage', 'Error loading product', { status, urlKey });
        }
        else if (status === 'ready' && !product) {
            logger.warn('ProductPage', 'Product not found after successful load', { urlKey });
        }
    }, [product, status, urlKey]);
    if (!endpoint) {
        return _jsx(ProductStatus, { tone: "muted", message: t('product.error.noEndpoint') });
    }
    if (!urlKey) {
        return _jsx(ProductStatus, { tone: "muted", message: t('product.error.noUrlKey') });
    }
    // If product is available, render it (SSR or CSR with data)
    if (product) {
        return _jsx(ProductDetails, { product: product });
    }
    // Handle error state
    if (status === 'error') {
        return _jsx(ProductStatus, { tone: "error", message: t('product.error.generic') });
    }
    // Handle product not found (after loading)
    if (status === 'ready') {
        return _jsx(ProductStatus, { tone: "error", message: t('product.error.generic') });
    }
    // Loading or idle state - show loading message
    return _jsx(ProductStatus, { tone: "info", message: t('product.loading') });
};
export default ProductPage;
