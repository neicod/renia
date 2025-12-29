import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// @env: mixed
import React from 'react';
export const ExtensionsContext = React.createContext(null);
export const ExtensionsProvider = ({ extensions, resolveComponent, routeMeta, children }) => (_jsx(ExtensionsContext.Provider, { value: { extensions, resolveComponent, routeMeta }, children: children }));
export const ExtensionsOutlet = ({ host, outlet, props, meta }) => {
    const ctx = React.useContext(ExtensionsContext);
    if (!ctx)
        return null;
    const entries = (ctx.extensions?.[host]?.[outlet] ?? []);
    if (!entries.length)
        return null;
    return (_jsx(_Fragment, { children: entries
            .filter((e) => e.enabled !== false)
            .map((entry, idx) => {
            const Comp = ctx.resolveComponent({ componentPath: entry.componentPath });
            const key = `${entry.componentPath}::${entry.id || idx}`;
            const mergedMeta = { ...(ctx.routeMeta ?? {}), ...(entry.meta ?? {}), ...(meta ?? {}) };
            return _jsx(Comp, { ...(entry.props ?? {}), ...(props ?? {}), meta: mergedMeta }, key);
        }) }));
};
export default ExtensionsOutlet;
