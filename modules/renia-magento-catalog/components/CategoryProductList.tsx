// @env: mixed
import React from 'react';
import { ProductList } from 'magento-product/components/ProductList';
import { ProductListingToolbar } from './ProductListingToolbar';
import { ProductListingPagination } from './ProductListingPagination';
import { useCategoryProductList } from '../hooks/useCategoryProductList';

type Props = {
  meta?: Record<string, unknown>;
};

export const CategoryProductList: React.FC<Props> = ({ meta }) => {
  const env = typeof window === 'undefined' ? 'ssr' : 'client';

  const category = React.useMemo(() => (meta as any)?.category, [meta]);
  const categoryUid = typeof category?.id === 'string' ? category.id : undefined;

  console.info('[CategoryProductList] Render', {
    env,
    categoryUid
  });

  const {
    hasRepo,
    products,
    total,
    status,
    isInitialLoading,
    sort,
    sortOptions,
    page,
    pageSize,
    pageSizeOptions,
    handleSortChange,
    handlePageSizeChange,
    handlePageChange
  } = useCategoryProductList({ env, categoryUid });

  if (!categoryUid || !hasRepo) return null;

  const controlsDisabled = status === 'loading';

  return (
    <div>
      <ProductListingToolbar
        sortOptions={sortOptions}
        value={sort}
        onChange={handleSortChange}
        total={total}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={handlePageSizeChange}
        disabled={controlsDisabled}
      />
      <ProductList
        products={products}
        loading={status === 'loading'}
        initialLoading={isInitialLoading}
        error={status === 'error' ? 'Failed to fetch products' : null}
        emptyLabel="No products in this category"
      />
      <ProductListingPagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={handlePageChange}
        disabled={controlsDisabled}
      />
    </div>
  );
};

export default CategoryProductList;
