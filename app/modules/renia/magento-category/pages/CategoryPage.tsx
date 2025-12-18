// @env: mixed

import React from 'react';
import { CategoryHero } from '../components/CategoryHero';
import { CategoryProductList } from 'renia-magento-catalog/components/CategoryProductList';
import { usePageContext } from '@framework/runtime/PageContext';

type CategoryPageProps = {
  meta?: Record<string, unknown>;
};

export const CategoryPage: React.FC<CategoryPageProps> = ({ meta }) => {
  const pageContext = usePageContext();
  const contextCategory = pageContext.extensions?.category?.category;
  const resolvedMeta = React.useMemo(
    () => ({
      ...(meta ?? {}),
      ...(contextCategory ? { category: contextCategory } : {})
    }),
    [contextCategory, meta]
  );

  if (typeof window !== 'undefined') {
    console.log('[CategoryPage] Received meta:', meta ? Object.keys(meta) : null);
    console.log('[CategoryPage] Has category:', (meta as any)?.category ? 'yes' : 'NO');
  }

  return (
    <div>
      <CategoryHero meta={resolvedMeta} />
      <CategoryProductList meta={resolvedMeta} />
    </div>
  );
};

export default CategoryPage;
