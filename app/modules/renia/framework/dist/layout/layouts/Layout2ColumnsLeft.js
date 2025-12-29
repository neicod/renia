import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export default function Layout2ColumnsLeft({ regions, main }) {
    return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "header", children: [_jsxs("div", { className: "header__inner", children: [_jsx("div", { className: "header__brand", children: _jsx(Link, { to: "/", className: "brand-logo", children: "Renia Store" }) }), _jsx("div", { className: "slot-stack", children: regions['control-menu'] })] }), _jsx("div", { className: "header__menu", children: regions['header'] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }, children: [_jsx("aside", { children: regions['left'] }), _jsxs("main", { className: "main", children: [regions['content'], main] })] }), _jsx("footer", { className: "footer", children: regions['footer'] }), regions['global-overlay']] }));
}
