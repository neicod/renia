import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExtensionsOutlet } from '@renia/framework/layout';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { Link } from 'react-router-dom';
import { toAbsolutePath } from '@renia/framework/router/paths';
export const ProductTile = ({ product }) => {
    const candidate = (product.urlPath ?? product.urlKey ?? product.sku);
    const link = toAbsolutePath(candidate) ?? '/';
    const { t } = useI18n();
    const host = 'renia-magento-product/components/ProductTile';
    return (_jsxs("article", { className: "product-tile", children: [_jsxs("div", { className: "product-tile__card", children: [_jsx("div", { className: "product-tile__media", children: _jsx(Link, { className: "product-tile__mediaLink", to: link, "aria-label": product.name, children: product.thumbnail?.url ? (_jsx("img", { className: "product-tile__image", src: product.thumbnail.url, alt: product.thumbnail.label ?? product.name, loading: "lazy" })) : (_jsx("div", { className: "product-tile__imagePlaceholder" })) }) }), _jsxs("div", { className: "product-tile__body", children: [_jsx(Link, { className: "product-tile__title", to: link, children: product.name }), product.price ? (_jsxs("div", { className: "product-tile__price", children: [product.price.value.toFixed(2), " ", product.price.currency] })) : (_jsx("div", { className: "product-tile__priceMuted", children: t('product.price.inCart') }))] })] }), _jsx("div", { className: "product-tile__popover", "aria-label": t('product.listing.actions'), children: _jsx("div", { className: "product-tile__extrasRow", children: _jsx(ExtensionsOutlet, { host: host, outlet: "actions", props: { product } }) }) })] }));
};
export default ProductTile;
