// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';

type LayoutProps = {
  regions: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function Layout1Column({ regions, main }: LayoutProps) {
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

      <main className="main">
        {regions['content']}
        {main}
      </main>

      <footer className="footer">{regions['footer']}</footer>

      {regions['global-overlay']}
    </div>
  );
}
