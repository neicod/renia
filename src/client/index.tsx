// @env: browser
// Entry klienta: hydratuje widok SSR (AppRoot) na podstawie bootstrapa z serwera.
// Musi pozostać w tym miejscu i być głównym entry bundla klienta; nie przenoś/nie usuwaj,
// bo hydratacja i nawigacja klientowa przestaną działać.
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from '@framework/runtime/AppRoot';

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
        <AppRoot bootstrap={bootstrap} />
      </BrowserRouter>
    </React.StrictMode>
  );
}
