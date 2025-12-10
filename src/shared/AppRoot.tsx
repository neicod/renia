import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { CartPage, CartControlLink } from 'renia-magento-cart';
import { WishlistPage, WishlistControlLink } from 'magento-wishlist';

const HomePage: React.FC = () => (
  <section style={{ display: 'grid', gap: '1.25rem' }}>
    <div>
      <h1>React SSR starter</h1>
      <p>Ten widok jest budowany w oparciu o dynamiczne trasy i sloty z modułów.</p>
    </div>
  </section>
);

type RouteEntry = {
  path: string;
  component?: string;
  componentPath?: string;
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
};

const AboutPage: React.FC = () => (
  <section>
    <h1>O projekcie</h1>
    <p>Dodaj swoje widoki, logikę routingu i integracje API według potrzeb.</p>
  </section>
);

const NotFoundPage: React.FC = () => (
  <section>
    <h1>Nie znaleziono</h1>
    <p>Sprawdź ścieżkę lub dodaj nową trasę.</p>
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
    'renia-magento-cart/components/CartControlLink': CartControlLink,
    'magento-wishlist/components/WishlistControlLink': WishlistControlLink,
    HomePage,
    AboutPage,
    CartPage,
    WishlistPage,
    CartControlLink,
    WishlistControlLink
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

  const routes = [
    { path: '/', component: 'HomePage' },
    { path: '/about', component: 'AboutPage' },
    ...bootstrap.routes
  ];

  const controlMenu = bootstrap.slots?.['control-menu'] ?? [];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      <header style={{ padding: '1rem 0' }}>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/">Start</Link>
          <Link to="/about">O projekcie</Link>
          {renderSlot(controlMenu)}
        </nav>
      </header>
      <main style={{ padding: '1rem 0' }}>
        <Routes>
          {routes.map((route) => {
            const Comp = resolveComponent(route);
            return <Route key={route.path} path={route.path} element={<Comp />} />;
          })}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AppRoot;
