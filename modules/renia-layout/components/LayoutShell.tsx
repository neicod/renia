// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';
import type { SlotEntry as BaseSlotEntry } from '../types';

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
};

const sortSlotEntries = (entries: SlotEntry[] = []) =>
  entries
    .filter((entry) => entry.enabled !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

const renderSlotEntries = (
  entries: SlotEntry[] = [],
  resolveComponent: (entry: { component?: string; componentPath?: string }) => React.ComponentType<any>,
  routeMeta?: Record<string, unknown>
) =>
  sortSlotEntries(entries).map((entry, idx) => {
    const Comp = resolveComponent(entry);
    const key = `${entry.componentPath || entry.component || 'slot'}-${idx}`;
    const mergedMeta = {
      ...(routeMeta ?? {}),
      ...(entry.meta ?? {})
    };
    return <Comp key={key} {...(entry.props ?? {})} meta={mergedMeta} />;
  });

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
  routeMeta
}) => {
  const controlMenu = renderSlotEntries(
    pickEntries('control-menu', layoutSlots, slots),
    resolveComponent,
    routeMeta
  );
  const header = renderSlotEntries(pickEntries('header', layoutSlots, slots), resolveComponent, routeMeta);
  const footer = renderSlotEntries(pickEntries('footer', layoutSlots, slots), resolveComponent, routeMeta);
  const left = renderSlotEntries(pickEntries('left', layoutSlots, slots), resolveComponent, routeMeta);
  const contentSlot = renderSlotEntries(pickEntries('content', layoutSlots, slots), resolveComponent, routeMeta);

  if (layout === '2column-left') {
    return (
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
    );
  }

  return (
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
      <main className="main">
        {contentSlot}
        {main}
      </main>
      <footer className="footer">{footer}</footer>
    </div>
  );
};

export default LayoutShell;
