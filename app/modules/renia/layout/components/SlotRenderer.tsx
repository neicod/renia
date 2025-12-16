// @env: mixed
import React from 'react';
import type { SlotEntry } from '../types';

type SlotComponentEntry = {
  component?: string;
  componentPath?: string;
};

type SlotContextValue = {
  subslots?: Record<string, SlotEntry[]>;
  resolveComponent: (entry: SlotComponentEntry) => React.ComponentType<any>;
  routeMeta?: Record<string, unknown>;
};

export const SlotContext = React.createContext<SlotContextValue | null>(null);

export const SlotProvider: React.FC<React.PropsWithChildren<SlotContextValue>> = ({
  subslots,
  resolveComponent,
  routeMeta,
  children
}) => (
  <SlotContext.Provider value={{ subslots, resolveComponent, routeMeta }}>{children}</SlotContext.Provider>
);

type SlotRendererProps = {
  name: string;
  meta?: Record<string, unknown>;
  props?: Record<string, unknown>;
};

export const SlotRenderer: React.FC<SlotRendererProps> = ({ name, meta, props }) => {
  const ctx = React.useContext(SlotContext);
  if (!ctx) return null;
  const allEntries = ctx.subslots?.[name];
  if (!allEntries?.length) return null;

  // Filter and sort by priority - higher priority renders first
  const entries = allEntries
    .filter((e) => e.enabled !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return (
    <>
      {entries.map((entry, idx) => {
        const Comp = ctx.resolveComponent(entry);
        const key = `${entry.componentPath || entry.component || 'slot'}-${idx}`;
        const mergedMeta = { ...(ctx.routeMeta ?? {}), ...(entry.meta ?? {}), ...(meta ?? {}) };
        return <Comp key={key} {...(entry.props ?? {})} {...(props ?? {})} meta={mergedMeta} />;
      })}
    </>
  );
};
