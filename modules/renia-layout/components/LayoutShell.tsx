// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';
import type { SlotEntry as BaseSlotEntry } from '../types';
import { SlotProvider } from './SlotRenderer';
import { useAppEnvironment } from '@framework/runtime/AppEnvContext';

type SlotEntry = BaseSlotEntry & {
  enabled?: boolean;
  id?: string;
};

type Props = {
  layout: string;
  main: React.ReactNode;
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>;
  slots: Record<string, SlotEntry[]>;
  layoutSlots?: Record<string, SlotEntry[]>;
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

const pickEntries = (
  name: string,
  layoutSlots?: Record<string, SlotEntry[]>,
  slots?: Record<string, SlotEntry[]>
) => layoutSlots?.[name] ?? slots?.[name] ?? [];

export const LayoutShell: React.FC<Props> = ({
  layout,
  main,
  resolveComponent,
  slots,
  layoutSlots,
  routeMeta,
  subslots
}) => {
  const { storeCode, store } = useAppEnvironment();
  const storeLabel = store?.code ?? storeCode ?? 'Sklep';
  const currencyLabel = store?.currency ?? 'USD';
  const localeLabel = store?.locale;

  const controlMenu = renderSlotEntries(
    pickEntries('control-menu', layoutSlots, slots),
    resolveComponent,
    routeMeta
  );
  const header = renderSlotEntries(pickEntries('header', layoutSlots, slots), resolveComponent, routeMeta);
  const footer = renderSlotEntries(pickEntries('footer', layoutSlots, slots), resolveComponent, routeMeta);
  const left = renderSlotEntries(pickEntries('left', layoutSlots, slots), resolveComponent, routeMeta);
  const contentSlot = renderSlotEntries(pickEntries('content', layoutSlots, slots), resolveComponent, routeMeta);
  const overlayEntries = renderSlotEntries(
    pickEntries('global-overlay', layoutSlots, slots),
    resolveComponent,
    routeMeta
  );

  const rendered =
    layout === '2column-left' ? (
      <div className="app-shell">
        <header className="header">
          <div className="header__inner">
            <div className="nav">
              <Link to="/">Start</Link>
              <Link to="/about">O projekcie</Link>
            </div>
            <div className="slot-stack">{controlMenu}</div>
          </div>
          <div className="header__menu">{header}</div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
          <aside>{left}</aside>
          <main className="main">
            {contentSlot}
            {main}
          </main>
        </div>
        <footer className="footer">{footer}</footer>
      </div>
    ) : (
      <div className="app-shell">
        <header className="header">
          <div className="header__inner">
            <div className="header__brand">
              <Link to="/" className="brand-logo">
                Renia Store
              </Link>
              <p className="brand-tagline">
                {storeLabel}
                {localeLabel ? ` · ${localeLabel}` : ''}
              </p>
              <p className="brand-meta" style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Waluta: {currencyLabel}
              </p>
            </div>
            <div className="nav">
              <Link to="/">Start</Link>
              <Link to="/about">O projekcie</Link>
            </div>
            <div className="slot-stack">{controlMenu}</div>
          </div>
          <div className="header__menu">{header}</div>
        </header>
        <main className="main">
          {contentSlot}
          {main}
        </main>
        <footer className="footer">{footer}</footer>
      </div>
    );

  return (
    <SlotProvider subslots={subslots} resolveComponent={resolveComponent} routeMeta={routeMeta}>
      {rendered}
      {overlayEntries}
    </SlotProvider>
  );
};

export default LayoutShell;
