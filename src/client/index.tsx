// @env: browser
// Entry klienta: hydratuje widok SSR (AppRoot) na podstawie bootstrapa z serwera.
// Musi pozostać w tym miejscu i być głównym entry bundla klienta; nie przenoś/nie usuwaj,
// bo hydratacja i nawigacja klientowa przestaną działać.
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from '@framework/runtime/AppRoot';

// Załaduj registerComponents wszystkich enabled modułów z app/etc/config.json
// (moduły mają zdefiniowane zależności więc kolejność jest ważna)
import 'renia-magento-cart/registerComponents';
import 'renia-magento-wishlist/registerComponents';
import 'renia-layout/registerComponents';
import 'renia-magento-category/registerComponents';
import 'magento-product/registerComponents';
import 'renia-magento-catalog/registerComponents';
import 'renia-magento-catalog-search/registerComponents';
import 'renia-ui-toast/registerComponents';
import 'renia-magento-cart-sidebar/registerComponents';
import 'renia-magento-configurable-product/registerComponents';
import 'renia-magento-configurable-product-cart/registerComponents';
import 'renia-i18n/registerComponents';

// Załaduj strategie produktów (per type)
import { registerStrategies as registerCartStrategies } from 'renia-magento-cart/registerStrategies';
import { registerStrategies as registerConfigurableStrategies } from 'renia-magento-configurable-product-cart/registerStrategies';

registerCartStrategies();
registerConfigurableStrategies();

declare global {
  interface Window {
    __APP_BOOTSTRAP__?: any;
  }
}

const rootElement = document.getElementById('root');
const bootstrap = window.__APP_BOOTSTRAP__ ?? { routes: [], slots: {} };

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
