// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';

type LayoutProps = {
  slots: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function Layout1Column({ slots, main }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <Link to="/" className="brand-logo">
              Renia Store
            </Link>
          </div>
          <div className="slot-stack">{slots['control-menu']}</div>
        </div>
        <div className="header__menu">{slots.header}</div>
      </header>

      <main className="main">
        {slots.content}
        {main}
      </main>

      <footer className="footer">{slots.footer}</footer>

      {slots['global-overlay']}
    </div>
  );
}
