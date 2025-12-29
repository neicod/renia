import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExtensionsOutlet } from '@renia/framework/layout';
import { useI18n } from 'renia-i18n/hooks/useI18n';
export const ProductDetails = ({ product }) => {
    const { t } = useI18n();
    const price = product.price
        ? `${product.price.value.toFixed(2)} ${product.price.currency}`
        : t('product.price.inCart');
    const host = 'renia-magento-product/pages/components/ProductDetails';
    const originalDiffers = product.priceOriginal && product.price && product.priceOriginal.value !== product.price.value;
    return (_jsxs("section", { className: "card", style: { display: 'grid', gap: '1rem' }, children: [_jsxs("div", { style: { display: 'grid', gap: '0.5rem' }, children: [_jsx("h1", { style: { margin: 0 }, children: product.name }), _jsx("div", { style: { color: '#2563eb', fontWeight: 700 }, children: price }), originalDiffers ? (_jsxs("div", { style: { color: '#94a3b8', textDecoration: 'line-through' }, children: [product.priceOriginal?.value.toFixed(2), " ", product.priceOriginal?.currency] })) : null] }), product.thumbnail?.url ? (_jsx("div", { style: {
                    maxWidth: '360px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc'
                }, children: _jsx("img", { src: product.thumbnail.url, alt: product.thumbnail.label ?? product.name, style: { width: '100%', display: 'block', objectFit: 'cover' } }) })) : null, _jsx("div", { style: { color: '#64748b' }, children: _jsx("p", { children: t('product.description.placeholder') }) }), _jsx(ExtensionsOutlet, { host: host, outlet: "actions", props: { product } })] }));
};
export default ProductDetails;
