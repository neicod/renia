// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';

type LayoutProps = {
  regions: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function Layout2ColumnsLeft({ regions, main }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <Link to="/" className="brand-logo">
              Renia Store
            </Link>
          </div>
          <div className="slot-stack">{regions['control-menu']}</div>
        </div>
        <div className="header__menu">{regions['header']}</div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        <aside>{regions['left']}</aside>
        <main className="main">
          {regions['content']}
          {main}
        </main>
      </div>

      <footer className="footer">{regions['footer']}</footer>

      {regions['global-overlay']}
    </div>
  );
}
