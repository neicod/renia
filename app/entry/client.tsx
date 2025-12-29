// @env: browser
// Entry klienta: hydratuje widok SSR (AppRoot) na podstawie bootstrapa z serwera.
// Musi pozostać w tym miejscu i być głównym entry bundla klienta; nie przenoś/nie usuwaj,
// bo hydratacja i nawigacja klientowa przestaną działać.
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from '@renia/framework/runtime/AppRoot';
import { loadInterceptorsClient, registerInterceptorMap } from '@renia/framework/interceptors/loadInterceptorsClient';
import { interceptorMap } from '../../generated/interceptors/interceptorMap.generated';
import { registerProductTypeComponentStrategy } from '@renia/framework/runtime/productTypeStrategies';
import { registerComponents } from '@renia/framework/registry/componentRegistry';
import { Layout1Column, Layout2ColumnsLeft, LayoutEmpty } from '@renia/framework/layout';

declare global {
  interface Window {
    __APP_BOOTSTRAP__?: any;
  }
}

const rootElement = document.getElementById('root');
const bootstrap = window.__APP_BOOTSTRAP__ ?? { routes: [], regions: {}, contexts: [], enabledModules: [] };
const basePath = typeof bootstrap.basePath === 'string' ? bootstrap.basePath : '';

// Register framework layout components
registerComponents({
  '@renia/framework/layout/layouts/Layout1Column': Layout1Column,
  '@renia/framework/layout/layouts/Layout2ColumnsLeft': Layout2ColumnsLeft,
  '@renia/framework/layout/layouts/LayoutEmpty': LayoutEmpty
});

const enabledModules = bootstrap.enabledModules ?? [];
registerInterceptorMap(interceptorMap);

const layoutNoop: any = {
  get: () => {
    throw new Error('[Layout] api.layout.get(...) is disabled. Use api.layout.at(...) instead.');
  },
  at: () => layoutNoop,
  add: () => layoutNoop,
  remove: () => {},
  setSortOrder: () => layoutNoop
};

// API object dla interceptorów - rejestruje strategie i komponenty
// Note: api.layout/api.extend are used to register components/strategies;
// regions/extensions snapshots are produced during SSR and rebuilt on navigation in AppRoot.
const interceptorApi = {
  registerProductTypeComponentStrategy,
  registerComponents,
  // No-op on client: layout tree is already provided by SSR bootstrap
  layout: layoutNoop,
  extend: {
    component: () => ({
      outlet: () => ({
        add: () => {},
        remove: () => {},
        enable: () => {},
        disable: () => {},
        clear: () => {}
      })
    })
  }
};

// Załaduj interceptory dla danego kontekstu
// To zarejestuje:
// - Strategie produktów per typ (e.g., SimpleProduct, ConfigurableProduct)
// - Komponenty w registry
// - Komponenty w drzewie layoutu (via api.layout)
(async () => {
  // Load only default interceptors to register components/strategies.
  // Route-specific layout is handled dynamically in AppRoot on navigation.
  await loadInterceptorsClient('default', interceptorApi, enabledModules, { includeDefault: true });

  // Hydratuj
  if (rootElement) {
    hydrateRoot(
      rootElement,
      <React.StrictMode>
        <BrowserRouter basename={basePath || undefined}>
          <AppRoot bootstrap={bootstrap} runtime="client" />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
})();
