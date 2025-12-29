// @env: mixed
import React from 'react';
import { useLocation } from 'react-router-dom';

type Props = {
  meta?: Record<string, unknown>;
};

export const NotFoundPage: React.FC<Props> = () => {
  const location = useLocation();
  const path = `${location.pathname}${location.search}`;

  return (
    <section className="card">
      <h1 style={{ margin: '0 0 0.5rem' }}>404</h1>
      <p style={{ margin: 0, color: '#4b5563' }}>
        Nie znaleziono strony: <code>{path}</code>
      </p>
    </section>
  );
};

export default NotFoundPage;

