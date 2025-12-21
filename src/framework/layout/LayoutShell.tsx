// @env: mixed
import React from 'react';
import type { RegionEntry, RegionsSnapshot } from './buildRegions';
import { ExtensionsProvider } from './ExtensionsOutlet';

type Props = {
  layout: string;
  main: React.ReactNode;
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>;
  regions: RegionsSnapshot;
  extensions?: any;
  routeMeta?: any;
};

const sortRegionEntries = (entries: RegionEntry[] = []) =>
  entries
    .filter((entry) => entry.enabled !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

const shouldRenderEntry = (entry: RegionEntry, routeMeta?: Record<string, unknown>) => {
  const meta = (entry.meta ?? {}) as Record<string, unknown> & {
    onlyForRouteTypes?: string | string[];
  };
  const allowedTypesRaw = meta?.onlyForRouteTypes;
  const allowedTypes = Array.isArray(allowedTypesRaw)
    ? allowedTypesRaw
    : typeof allowedTypesRaw === 'string'
      ? [allowedTypesRaw]
      : undefined;

  if (allowedTypes?.length) {
    const currentType = typeof (routeMeta as any)?.type === 'string' ? (routeMeta as any).type : undefined;
    if (!currentType || !allowedTypes.includes(currentType)) {
      return false;
    }
  }

  return true;
};

const renderRegionEntries = (
  entries: RegionEntry[] = [],
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>,
  routeMeta?: Record<string, unknown>
) => {
  const filtered = entries.filter((entry) => shouldRenderEntry(entry, routeMeta));

  return sortRegionEntries(filtered).map((entry, idx) => {
    const Comp = resolveComponent(entry);
    const key = `${entry.componentPath || entry.component || 'region'}-${idx}`;
    const mergedMeta = {
      ...(routeMeta ?? {}),
      ...(entry.meta ?? {})
    };
    return <Comp key={key} {...(entry.props ?? {})} meta={mergedMeta} />;
  });
};


export const LayoutShell: React.FC<Props> = ({
  layout,
  main,
  resolveComponent,
  regions,
  extensions,
  routeMeta
}) => {
  // 1. Render all regions to React.ReactNode
  const renderedRegions: Record<string, React.ReactNode> = {};

  for (const regionName of Object.keys(regions)) {
    renderedRegions[regionName] = renderRegionEntries(
      regions[regionName] ?? [],
      resolveComponent,
      routeMeta
    );
  }

  // 2. Load layout component (default to 1column if not specified)
  const layoutPath = layout || '@framework/layout/layouts/Layout1Column';
  const LayoutComponent = resolveComponent({ componentPath: layoutPath });

  // 3. Pass regions and main to layout component
  return (
    <ExtensionsProvider extensions={extensions} resolveComponent={resolveComponent} routeMeta={routeMeta}>
      <LayoutComponent regions={renderedRegions} main={main} routeMeta={routeMeta} />
    </ExtensionsProvider>
  );
};

export default LayoutShell;
