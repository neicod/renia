// @env: mixed
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { registerComponents, resolveComponentEntry } from '../registry/componentRegistry';
import { AppEnvironmentProvider, type AppRuntime } from './AppEnvContext';
import type { StoreConfig } from 'renia-magento-store';
import LayoutShell from 'renia-layout/components/LayoutShell';
import type { SlotEntry as LayoutSlotEntry } from 'renia-layout/types';
import { I18nProvider } from 'renia-i18n/context/I18nProvider';
import 'renia-magento-cart/registerComponents';
import 'renia-magento-wishlist/registerComponents';
import 'renia-magento-configurable-product/registerComponents';
import 'renia-magento-category/registerComponents';
import 'renia-magento-catalog/registerComponents';
import 'renia-magento-catalog-search/registerComponents';
import 'magento-product/registerComponents';
import 'renia-layout/registerComponents';
import 'renia-magento-cart-sidebar/registerComponents';
import 'renia-i18n/registerComponents';
import 'renia-ui-toast/registerComponents';
import 'renia-magento-customer/registerComponents';

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
    store?: StoreConfig;
    i18n?: {
      lang?: string;
      messages?: Record<string, string>;
    };
  };
};

const AboutPage: React.FC = () => (
  <section className="card">
    <h1 style={{ margin: '0 0 0.5rem' }}>O projekcie</h1>
    <p style={{ margin: 0 }}>Dodaj swoje widoki, logikę routingu i integracje API według potrzeb.</p>
  </section>
);

const MissingComponent: React.FC = () => null;

registerComponents({
  HomePage,
  AboutPage
});

type AppRootProps = {
  bootstrap: BootstrapData;
  runtime?: AppRuntime;
};

export const AppRoot: React.FC<AppRootProps> = ({ bootstrap, runtime = 'client' }) => {
  const resolveComponent = (entry: { component?: string; componentPath?: string }): React.ComponentType<any> =>
    resolveComponentEntry(entry, MissingComponent);

  const routes = [
    { path: '/', component: 'HomePage' },
    { path: '/about', component: 'AboutPage' },
    ...bootstrap.routes
  ];

  const storeCode = (bootstrap?.config as any)?.magentoStoreCode ?? bootstrap?.config?.store?.code;
  const storeConfig = bootstrap?.config?.store;
  const i18n = bootstrap?.config?.i18n ?? {};

  return (
    <I18nProvider lang={i18n.lang} messages={i18n.messages}>
      <AppEnvironmentProvider runtime={runtime} storeCode={storeCode} store={storeConfig}>
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
                      subslots={bootstrap.subslots}
                      routeMeta={route.meta}
                    />
                  }
                />
              );
            })}
          </Routes>
        </div>
      </AppEnvironmentProvider>
    </I18nProvider>
  );
};

export default AppRoot;
