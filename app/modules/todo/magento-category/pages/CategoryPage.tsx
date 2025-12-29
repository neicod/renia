// @env: mixed

import React from 'react';
import { CategoryHero } from '../components/CategoryHero';
import { CategoryProductList } from 'renia-magento-catalog/components/CategoryProductList';
import { usePageContext } from '@renia/framework/runtime/PageContext';
import { useRenderedLocation } from '@renia/framework/router/renderedLocation';

type CategoryPageProps = {
  meta?: Record<string, unknown>;
};

export const CategoryPage: React.FC<CategoryPageProps> = ({ meta }) => {
  const pageContext = usePageContext();
  const location = useRenderedLocation();
  const contextCategory = pageContext.extensions?.category?.category;

  const renderedPath = React.useMemo(() => {
    const ssrPath = typeof (meta as any)?.__ssrPath === 'string' ? String((meta as any).__ssrPath) : null;
    const pathname = ssrPath ?? location.pathname ?? '';
    const trimmed = pathname.replace(/^\/+|\/+$/g, '');
    return trimmed || null;
  }, [location.pathname, (meta as any)?.__ssrPath]);

  // During CSR navigation, PageContext may temporarily contain stale data from the previous URL.
  // Avoid passing mismatched category data to downstream components.
  const contextCategoryForCurrentUrl = React.useMemo(() => {
    const urlPath = typeof (contextCategory as any)?.urlPath === 'string' ? String((contextCategory as any).urlPath) : null;
    if (!urlPath) return contextCategory ?? null;

    const locationPath = renderedPath;

    if (locationPath && locationPath !== urlPath) return null;
    return contextCategory ?? null;
  }, [contextCategory, renderedPath]);

  const resolvedMeta = React.useMemo(
    () => ({
      ...(meta ?? {}),
      ...(contextCategoryForCurrentUrl ? { category: contextCategoryForCurrentUrl } : {})
    }),
    [contextCategoryForCurrentUrl, meta]
  );

  return (
    <div>
      <CategoryHero meta={resolvedMeta} />
      <CategoryProductList meta={resolvedMeta} />
    </div>
  );
};

export default CategoryPage;
