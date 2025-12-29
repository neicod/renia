// @env: mixed
import React from 'react';
import type { ExtensionEntry, ExtensionsSnapshot } from './ExtensionsRegistry';

type ExtensionsContextValue = {
  extensions?: ExtensionsSnapshot;
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>;
  routeMeta?: Record<string, unknown>;
};

export const ExtensionsContext = React.createContext<ExtensionsContextValue | null>(null);

export const ExtensionsProvider: React.FC<
  React.PropsWithChildren<{
    extensions?: ExtensionsSnapshot;
    resolveComponent: ExtensionsContextValue['resolveComponent'];
    routeMeta?: Record<string, unknown>;
  }>
> = ({ extensions, resolveComponent, routeMeta, children }) => (
  <ExtensionsContext.Provider value={{ extensions, resolveComponent, routeMeta }}>
    {children}
  </ExtensionsContext.Provider>
);

type Props = {
  host: string;
  outlet: string;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export const ExtensionsOutlet: React.FC<Props> = ({ host, outlet, props, meta }) => {
  const ctx = React.useContext(ExtensionsContext);
  if (!ctx) return null;

  const entries = (ctx.extensions?.[host]?.[outlet] ?? []) as ExtensionEntry[];
  if (!entries.length) return null;

  return (
    <>
      {entries
        .filter((e) => e.enabled !== false)
        .map((entry, idx) => {
          const Comp = ctx.resolveComponent({ componentPath: entry.componentPath });
          const key = `${entry.componentPath}::${entry.id || idx}`;
          const mergedMeta = { ...(ctx.routeMeta ?? {}), ...(entry.meta ?? {}), ...(meta ?? {}) };
          return <Comp key={key} {...(entry.props ?? {})} {...(props ?? {})} meta={mergedMeta} />;
        })}
    </>
  );
};

export default ExtensionsOutlet;

