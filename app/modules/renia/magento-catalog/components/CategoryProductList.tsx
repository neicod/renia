// @env: mixed
import React from 'react';
import type { ProductSearchResults } from 'renia-magento-product';
import { useCategoryProductList } from '../hooks/useCategoryProductList';
import { useI18n } from 'renia-i18n/hooks/useI18n';
import { ListingPageContent } from 'renia-magento-product-listing/components/ListingPageContent';
import { useCategoryContext } from '../hooks/useCategoryContext';

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
  const { category, uid: categoryUid, uidStatus } = useCategoryContext({ meta });
  const categoryLabel = typeof (category as any)?.label === 'string' ? (category as any).label : undefined;

  // Merge initialListing from props (SSR injection) or meta (fallback)
  const initialListing = React.useMemo(
    () => initialListingProp ?? (meta as any)?.categoryProductListing ?? null,
    [initialListingProp, meta]
  );

  const { t } = useI18n();

  const {
    status,
    isInitialLoading,
    listing: { products, total, sort, sortOptions, page, pageSize, pageSizeOptions },
    handlers: { onSortChange, onItemsPerPageChange, onPageChange }
  } = useCategoryProductList({ categoryUid, initialListing });

  const isResolvingUid = uidStatus === 'loading';
  const uidError = uidStatus === 'error';

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
      isLoading={isResolvingUid || status === 'loading'}
      isInitialLoading={isResolvingUid || isInitialLoading}
      hasError={uidError || status === 'error'}
      errorMessage={t('catalog.listing.error')}
      emptyMessage={t('catalog.listing.empty')}
      // Category title is rendered by CategoryHero (H1). Avoid duplicating it here.
      header={
        categoryLabel
          ? null
          : <h2 className="section-title">{t('catalog.listing.title')}</h2>
      }
    />
  );
};

export default CategoryProductList;
