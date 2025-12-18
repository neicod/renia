// @env: browser
// Entry klienta: hydratuje widok SSR (AppRoot) na podstawie bootstrapa z serwera.
// Musi pozostać w tym miejscu i być głównym entry bundla klienta; nie przenoś/nie usuwaj,
// bo hydratacja i nawigacja klientowa przestaną działać.
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from '@framework/runtime/AppRoot';
import { loadInterceptorsClient } from '@framework/interceptors/loadInterceptorsClient';
import { registerProductTypeComponentStrategy } from 'renia-magento-product/services/productStrategies';
import { registerComponents } from '@framework/registry/componentRegistry';
import { Layout1Column, Layout2ColumnsLeft, LayoutEmpty } from '@framework/layout';

declare global {
  interface Window {
    __APP_BOOTSTRAP__?: any;
  }
}

const rootElement = document.getElementById('root');
const bootstrap = window.__APP_BOOTSTRAP__ ?? { routes: [], slots: {}, contexts: [], enabledModules: [] };
const basePath = typeof bootstrap.basePath === 'string' ? bootstrap.basePath : '';

// Register framework layout components
registerComponents({
  '@framework/layout/layouts/Layout1Column': Layout1Column,
  '@framework/layout/layouts/Layout2ColumnsLeft': Layout2ColumnsLeft,
  '@framework/layout/layouts/LayoutEmpty': LayoutEmpty
});

const enabledModules = bootstrap.enabledModules ?? [];

// API object dla interceptorów - rejestruje strategie i komponenty
// Note: api.layout is a no-op on client since slots come from SSR bootstrap
const interceptorApi = {
  registerProductTypeComponentStrategy,
  registerComponents,
  layout: {
    get: () => ({
      add: () => {
        // No-op on client: layout tree is already provided by SSR bootstrap
      }
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
