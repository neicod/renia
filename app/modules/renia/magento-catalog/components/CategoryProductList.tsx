// @env: mixed
import React from 'react';
import { useCategoryProductList } from '../hooks/useCategoryProductList';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { ListingPageContent } from './ListingPageContent';

import type { ProductSearchResults } from 'magento-product';

type Props = {
  meta?: Record<string, unknown>;
  initialListing?: ProductSearchResults | null;
};

/**
 * CategoryProductList - Category listing page orchestrator
 *
 * Responsibility:
 * - Extract category data from meta
 * - Call useCategoryProductList hook
 * - Render header with category title
 * - Delegate listing UI to ListingPageContent
 */
export const CategoryProductList: React.FC<Props> = ({ meta, initialListing: initialListingProp }) => {
  const category = React.useMemo(() => (meta as any)?.category, [meta]);
  const categoryLabel = typeof category?.label === 'string' ? category.label : undefined;
  const categoryUid = typeof category?.id === 'string' ? category.id : undefined;
  const initialListing = React.useMemo(
    () => initialListingProp ?? (meta as any)?.categoryProductListing,
    [initialListingProp, meta]
  );
  const { t } = useI18n();

  const {
    status,
    isInitialLoading,
    listing: { products, total, sort, sortOptions, page, pageSize, pageSizeOptions },
    handlers: { onSortChange, onItemsPerPageChange, onPageChange }
  } = useCategoryProductList({ categoryUid, initialListing });

  if (!categoryUid) {
    return null;
  }

  return (
    <ListingPageContent
      products={products}
      total={total}
      currentPage={page}
      pageSize={pageSize}
      sortOptions={sortOptions}
      selectedSort={sort}
      onSortChange={onSortChange}
      pageSizeOptions={pageSizeOptions}
      onItemsPerPageChange={onItemsPerPageChange}
      onPageChange={onPageChange}
      isLoading={status === 'loading'}
      isInitialLoading={isInitialLoading}
      hasError={status === 'error'}
      errorMessage={t('catalog.listing.error')}
      emptyMessage={t('catalog.listing.empty')}
      header={<h2 className="section-title">{categoryLabel ?? t('catalog.listing.title')}</h2>}
    />
  );
};

export default CategoryProductList;
