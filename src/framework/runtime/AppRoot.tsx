// @env: mixed
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { registerComponents, resolveComponentEntry } from '../registry/componentRegistry';
import LayoutShell from 'renia-layout/components/LayoutShell';
import type { SlotEntry as LayoutSlotEntry } from 'renia-layout/types';
import 'renia-magento-cart/registerComponents';
import 'magento-wishlist/registerComponents';
import 'renia-magento-category/registerComponents';
import 'renia-magento-catalog/registerComponents';
import 'renia-magento-catalog-search/registerComponents';
import 'magento-product/registerComponents';
import 'renia-layout/registerComponents';

const HomePage: React.FC = () => (
  <section className="card">
    <h1 style={{ margin: '0 0 0.5rem' }}>React SSR starter</h1>
    <p style={{ margin: 0 }}>Ten widok jest budowany w oparciu o dynamiczne trasy i sloty z modułów.</p>
  </section>
);

type RouteEntry = {
  path: string;
  component?: string;
  componentPath?: string;
  layout?: string;
  meta?: Record<string, any>;
};

type SlotEntry = LayoutSlotEntry & {
  id?: string;
  enabled?: boolean;
};

type BootstrapData = {
  routes: RouteEntry[];
  slots: Record<string, SlotEntry[]>;
  layoutSlots?: Record<string, SlotEntry[]>;
  layouts?: Record<string, string[]>;
  subslots?: Record<string, any>;
  config?: {
    magentoGraphQLEndpoint?: string;
    magentoStoreCode?: string;
    magentoRootCategoryId?: string;
    magentoProxyEndpoint?: string;
    preloadedCategoryMenu?: any;
  };
};

const AboutPage: React.FC = () => (
  <section className="card">
    <h1 style={{ margin: '0 0 0.5rem' }}>O projekcie</h1>
    <p style={{ margin: 0 }}>Dodaj swoje widoki, logikę routingu i integracje API według potrzeb.</p>
  </section>
);

const NotFoundPage: React.FC = () => (
  <section className="card">
    <h1 style={{ margin: '0 0 0.5rem' }}>Nie znaleziono</h1>
    <p style={{ margin: 0 }}>Sprawdź ścieżkę lub dodaj nową trasę.</p>
  </section>
);

registerComponents({
  HomePage,
  AboutPage
});

type AppRootProps = {
  bootstrap: BootstrapData;
};

export const AppRoot: React.FC<AppRootProps> = ({ bootstrap }) => {
  const resolveComponent = (entry: { component?: string; componentPath?: string }): React.ComponentType<any> =>
    resolveComponentEntry(entry, NotFoundPage);

  const routes = [
    { path: '/', component: 'HomePage' },
    { path: '/about', component: 'AboutPage' },
    ...bootstrap.routes
  ];

  return (
    <div>
      <Routes>
        {routes.map((route) => {
          const Comp = resolveComponent(route);
          const layout = route.layout ?? '1column';
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <LayoutShell
                  layout={layout}
                  main={<Comp />}
                  resolveComponent={resolveComponent}
                  slots={bootstrap.slots}
                  layoutSlots={bootstrap.layoutSlots}
                  routeMeta={route.meta}
                />
              }
            />
          );
        })}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default AppRoot;
