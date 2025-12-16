// @env: browser
// Entry klienta: hydratuje widok SSR (AppRoot) na podstawie bootstrapa z serwera.
// Musi pozostać w tym miejscu i być głównym entry bundla klienta; nie przenoś/nie usuwaj,
// bo hydratacja i nawigacja klientowa przestaną działać.
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from '@framework/runtime/AppRoot';
import { loadInterceptorsClient } from '@framework/interceptors/loadInterceptorsClient';
import { registerProductTypeComponentStrategy } from 'magento-product/services/productStrategies';
import { registerComponents } from '@framework/registry/componentRegistry';

declare global {
  interface Window {
    __APP_BOOTSTRAP__?: any;
  }
}

const rootElement = document.getElementById('root');
const bootstrap = window.__APP_BOOTSTRAP__ ?? { routes: [], slots: {}, contexts: [], enabledModules: [] };

// Bootstrap zawiera konteksty strony (category, product, search, etc)
// loadInterceptorsClient zawsze ładuje default, plus specified kontekst
const routeContexts = bootstrap.contexts ?? [];
const enabledModules = bootstrap.enabledModules ?? [];
// Only load non-default contexts here, default is loaded automatically by loadInterceptorsClient
const contextsToLoad = routeContexts.length > 0 ? routeContexts : ['default'];

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
  // Load contexts (loadInterceptorsClient zawsze ładuje default + specified context)
  for (const context of contextsToLoad) {
    await loadInterceptorsClient(context, interceptorApi, enabledModules);
  }

  // Hydratuj
  if (rootElement) {
    hydrateRoot(
      rootElement,
      <React.StrictMode>
        <BrowserRouter>
          <AppRoot bootstrap={bootstrap} runtime="client" />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
})();
