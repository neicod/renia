import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ProductTile } from './ProductTile.js';
export const ProductList = ({ products, loading, initialLoading = false, error, emptyLabel = 'Brak produktów w tej kategorii' }) => {
    const isRefreshing = Boolean(loading) && products.length > 0;
    if (error && products.length === 0) {
        return _jsxs("div", { style: { color: '#b91c1c' }, children: ["B\u0142\u0105d: ", error] });
    }
    if (initialLoading) {
        return _jsx("div", { style: { color: '#6b7280' }, children: "\u0141adowanie produkt\u00F3w..." });
    }
    if (!products.length) {
        return _jsx("div", { style: { color: '#6b7280' }, children: emptyLabel });
    }
    return (_jsxs("div", { children: [error && (_jsxs("div", { style: { color: '#b91c1c', marginBottom: '0.5rem' }, children: ["B\u0142\u0105d: ", error] })), _jsxs("div", { className: "product-gridWrap", children: [_jsx("div", { className: "product-grid", "data-loading": loading && products.length === 0 ? 'true' : 'false', children: products.map((p) => (_jsx(ProductTile, { product: p }, p.id))) }), isRefreshing ? (_jsx("div", { className: "product-gridOverlay", "aria-hidden": "true", children: _jsx("div", { className: "product-gridOverlay__pill", children: "Aktualizuj\u0119\u2026" }) })) : null] })] }));
};
export default ProductList;
