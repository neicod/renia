import { jsx as _jsx } from "react/jsx-runtime";
import { ExtensionsProvider } from './ExtensionsOutlet';
const sortRegionEntries = (entries = []) => entries
    .filter((entry) => entry.enabled !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
const shouldRenderEntry = (entry, routeMeta) => {
    const meta = (entry.meta ?? {});
    const allowedTypesRaw = meta?.onlyForRouteTypes;
    const allowedTypes = Array.isArray(allowedTypesRaw)
        ? allowedTypesRaw
        : typeof allowedTypesRaw === 'string'
            ? [allowedTypesRaw]
            : undefined;
    if (allowedTypes?.length) {
        const currentType = typeof routeMeta?.type === 'string' ? routeMeta.type : undefined;
        if (!currentType || !allowedTypes.includes(currentType)) {
            return false;
        }
    }
    return true;
};
const renderRegionEntries = (entries = [], resolveComponent, routeMeta) => {
    const filtered = entries.filter((entry) => shouldRenderEntry(entry, routeMeta));
    return sortRegionEntries(filtered).map((entry, idx) => {
        const Comp = resolveComponent(entry);
        const key = `${entry.componentPath || entry.component || 'region'}-${idx}`;
        const mergedMeta = {
            ...(routeMeta ?? {}),
            ...(entry.meta ?? {})
        };
        return _jsx(Comp, { ...(entry.props ?? {}), meta: mergedMeta }, key);
    });
};
export const LayoutShell = ({ layout, main, resolveComponent, regions, extensions, routeMeta }) => {
    // 1. Render all regions to React.ReactNode
    const renderedRegions = {};
    for (const regionName of Object.keys(regions)) {
        renderedRegions[regionName] = renderRegionEntries(regions[regionName] ?? [], resolveComponent, routeMeta);
    }
    // 2. Load layout component (default to 1column if not specified)
    const layoutPath = layout || '@renia/framework/layout/layouts/Layout1Column';
    const LayoutComponent = resolveComponent({ componentPath: layoutPath });
    // 3. Pass regions and main to layout component
    return (_jsx(ExtensionsProvider, { extensions: extensions, resolveComponent: resolveComponent, routeMeta: routeMeta, children: _jsx(LayoutComponent, { regions: renderedRegions, main: main, routeMeta: routeMeta }) }));
};
export default LayoutShell;
