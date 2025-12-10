import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CartPage, CartControlLink } from 'renia-magento-cart';
import { WishlistPage, WishlistControlLink } from 'magento-wishlist';
import { CategoryPage } from 'renia-magento-category/pages/CategoryPage';
import { CategoryMainMenu } from 'renia-magento-category/components/CategoryMainMenu';

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
};

type SlotEntry = {
  slot: string;
  component?: string;
  componentPath?: string;
  priority?: number;
  enabled?: boolean;
  id?: string;
};

type BootstrapData = {
  routes: RouteEntry[];
  slots: Record<string, SlotEntry[]>;
  layoutSlots?: Record<string, SlotEntry[]>;
  layouts?: Record<string, string[]>;
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

type AppRootProps = {
  bootstrap: BootstrapData;
};

export const AppRoot: React.FC<AppRootProps> = ({ bootstrap }) => {
  const componentRegistry: Record<string, React.FC> = {
    'home': HomePage,
    'about': AboutPage,
    'renia-magento-cart/pages/CartPage': CartPage,
    'magento-wishlist/pages/WishlistPage': WishlistPage,
    'renia-magento-category/pages/CategoryPage': CategoryPage,
    'renia-magento-cart/components/CartControlLink': CartControlLink,
    'magento-wishlist/components/WishlistControlLink': WishlistControlLink,
    'renia-magento-category/components/CategoryMainMenu': CategoryMainMenu,
    HomePage,
    AboutPage,
    CartPage,
    WishlistPage,
    CategoryPage,
    CartControlLink,
    WishlistControlLink,
    CategoryMainMenu
  };

  const resolveComponent = (entry: { component?: string; componentPath?: string }): React.FC => {
    if (entry.componentPath && componentRegistry[entry.componentPath]) return componentRegistry[entry.componentPath];
    if (entry.component && componentRegistry[entry.component]) return componentRegistry[entry.component];
    return NotFoundPage;
  };

  const renderSlot = (entries: SlotEntry[] = []) =>
    entries
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .filter((entry) => entry.enabled !== false)
      .map((entry, idx) => {
        const Comp = resolveComponent(entry);
        const key = `${entry.componentPath || entry.component || 'slot'}-${idx}`;
        return <Comp key={key} />;
      });

  const renderNamedSlot = (name: string) => {
    const entries = bootstrap.layoutSlots?.[name] ?? bootstrap.slots[name] ?? [];
    return renderSlot(entries);
  };

  const LayoutShell: React.FC<{ layout: string; main: React.ReactNode }> = ({ layout, main }) => {
    const controlMenu = renderNamedSlot('control-menu');
    const header = renderNamedSlot('header');
    const footer = renderNamedSlot('footer');
    const left = renderNamedSlot('left');

    if (layout === '2column-left') {
      return (
        <div className="app-shell">
          <header className="header">
            <div className="header__inner">
              <div className="nav">
                <Link to="/">Start</Link>
                <Link to="/about">O projekcie</Link>
              </div>
              <div className="slot-stack">
                {controlMenu}
              </div>
            </div>
            <div className="header__menu">{header}</div>
          </header>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
            <aside>{left}</aside>
            <main className="main">{main}</main>
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
            <div className="slot-stack">
              {controlMenu}
            </div>
          </div>
          <div className="header__menu">{header}</div>
        </header>
        <main className="main">{main}</main>
        <footer className="footer">{footer}</footer>
      </div>
    );
  };

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
              element={<LayoutShell layout={layout} main={<Comp />} />}
            />
          );
        })}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default AppRoot;
