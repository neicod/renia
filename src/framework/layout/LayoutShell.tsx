// @env: mixed
import React from 'react';
import type { SlotEntry as BaseSlotEntry } from './types';
import { SlotProvider } from './SlotRenderer';

type SlotEntry = BaseSlotEntry & {
  enabled?: boolean;
  id?: string;
};

type Props = {
  layout: string;
  main: React.ReactNode;
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>;
  slots: Record<string, SlotEntry[]>;
  routeMeta?: any;
  subslots?: Record<string, SlotEntry[]>;
};

const sortSlotEntries = (entries: SlotEntry[] = []) =>
  entries
    .filter((entry) => entry.enabled !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

const shouldRenderEntry = (entry: SlotEntry, routeMeta?: Record<string, unknown>) => {
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

const renderSlotEntries = (
  entries: SlotEntry[] = [],
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>,
  routeMeta?: Record<string, unknown>
) => {
  const filtered = entries.filter((entry) => shouldRenderEntry(entry, routeMeta));

  return sortSlotEntries(filtered).map((entry, idx) => {
    const Comp = resolveComponent(entry);
    const key = `${entry.componentPath || entry.component || 'slot'}-${idx}`;
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
  slots,
  routeMeta,
  subslots
}) => {
  // 1. Render all slots to React.ReactNode
  const renderedSlots: Record<string, React.ReactNode> = {};

  for (const slotName of Object.keys(slots)) {
    renderedSlots[slotName] = renderSlotEntries(
      slots[slotName] ?? [],
      resolveComponent,
      routeMeta
    );
  }

  // 2. Load layout component (default to 1column if not specified)
  const layoutPath = layout || '@framework/layout/layouts/Layout1Column';
  const LayoutComponent = resolveComponent({ componentPath: layoutPath });

  // 3. Pass slots and main to layout component
  return (
    <SlotProvider subslots={subslots} resolveComponent={resolveComponent} routeMeta={routeMeta}>
      <LayoutComponent slots={renderedSlots} main={main} routeMeta={routeMeta} />
    </SlotProvider>
  );
};

export default LayoutShell;
