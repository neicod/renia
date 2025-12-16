// @env: mixed

import React from 'react';
import { CategoryHeader } from '../components/CategoryHeader';
import { CategoryProductList } from 'renia-magento-catalog/components/CategoryProductList';

type CategoryPageProps = {
  meta?: Record<string, unknown>;
};

export const CategoryPage: React.FC<CategoryPageProps> = ({ meta }) => {
  return (
    <div>
      <CategoryHeader meta={meta} />
      <CategoryProductList meta={meta} />
    </div>
  );
};

export default CategoryPage;
