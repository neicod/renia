// @env: mixed
import React from 'react';
import type { CmsPage as CmsPageType } from '../services/cmsPage';
import { useLocation } from 'react-router-dom';

type Props = {
  meta?: Record<string, unknown>;
};

const normalizePath = (pathname: string): string => {
  const trimmed = (pathname ?? '').replace(/^\/+|\/+$/g, '');
  return trimmed.replace(/\.html$/i, '');
};

export const CmsPage: React.FC<Props> = ({ meta }) => {
  const location = useLocation();
  const page = (meta as any)?.cmsPage as CmsPageType | null | undefined;
  const identifierFromMeta = typeof (meta as any)?.cmsPageIdentifier === 'string' ? String((meta as any).cmsPageIdentifier) : null;
  const identifier = identifierFromMeta ?? normalizePath(location.pathname);

  if (!page) {
    return (
      <section className="card">
        <h1 style={{ margin: '0 0 0.5rem' }}>CMS</h1>
        <p style={{ margin: 0, color: '#4b5563' }}>
          Brak danych CMS dla <code>{identifier || '/'}</code>.
        </p>
      </section>
    );
  }

  const title = typeof page.title === 'string' && page.title.trim() ? page.title : identifier;
  const content = typeof page.content === 'string' ? page.content : '';

  return (
    <section className="card">
      <h1 style={{ margin: '0 0 0.75rem' }}>{title}</h1>
      {content ? (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p style={{ margin: 0, color: '#4b5563' }}>Strona CMS jest pusta.</p>
      )}
    </section>
  );
};

export default CmsPage;

