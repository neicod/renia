// @env: mixed
import React from 'react';
import { ProductList } from 'magento-product/components/ProductList';
import { ProductListingToolbar } from './ProductListingToolbar';
import { ProductListingPagination } from './ProductListingPagination';
import { useCategoryProductList } from '../hooks/useCategoryProductList';

import type { ProductSearchResults } from 'magento-product';

type Props = {
  meta?: Record<string, unknown>;
  initialListing?: ProductSearchResults | null;
};

export const CategoryProductList: React.FC<Props> = ({ meta, initialListing: initialListingProp }) => {
  const env = typeof window === 'undefined' ? 'ssr' : 'client';

  const category = React.useMemo(() => (meta as any)?.category, [meta]);
  const categoryUid = typeof category?.id === 'string' ? category.id : undefined;
  const initialListing = React.useMemo(
    () => initialListingProp ?? (meta as any)?.categoryProductListing,
    [initialListingProp, meta]
  );

  const {
    status,
    isInitialLoading,
    listing: { products, total, sort, sortOptions, page, pageSize, pageSizeOptions },
    handlers: { onSortChange, onItemsPerPageChange, onPageChange }
  } = useCategoryProductList({ env, categoryUid, initialListing });

  if (!categoryUid) {
    return null;
  }

  const controlsDisabled = status === 'loading';

  return (
    <div>
      <ProductListingToolbar
        sortOptions={sortOptions}
        selectedSort={sort}
        onSortChange={onSortChange}
        totalItems={total}
        currentPage={page}
        itemsPerPage={pageSize}
        pageSizeOptions={pageSizeOptions}
        onItemsPerPageChange={onItemsPerPageChange}
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
        onPageChange={onPageChange}
        disabled={controlsDisabled}
      />
    </div>
  );
};

export default CategoryProductList;
