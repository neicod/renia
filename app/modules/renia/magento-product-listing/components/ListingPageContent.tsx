// @env: mixed
import React from 'react';
import { ProductList } from 'renia-magento-product/components/ProductList';
import { ProductListingToolbar } from './ProductListingToolbar';
import { ProductListingPagination } from './ProductListingPagination';
import type { Product } from 'renia-magento-product';

export type ListingPageContentProps = {
  products: Product[];
  total: number;
  currentPage: number;
  pageSize: number;

  sortOptions: Array<{ value: string; label: string }>;
  selectedSort: string;
  onSortChange: (nextSort: string) => void;

  pageSizeOptions: number[];
  onItemsPerPageChange: (nextPageSize: number) => void;
  onPageChange: (nextPage: number) => void;

  isLoading: boolean;
  isInitialLoading: boolean;
  hasError: boolean;

  errorMessage: string;
  emptyMessage: string;

  header?: React.ReactNode;
};

export const ListingPageContent: React.FC<ListingPageContentProps> = ({
  products,
  total,
  currentPage,
  pageSize,
  sortOptions,
  selectedSort,
  onSortChange,
  pageSizeOptions,
  onItemsPerPageChange,
  onPageChange,
  isLoading,
  isInitialLoading,
  hasError,
  errorMessage,
  emptyMessage,
  header
}) => {
  const hasProducts = products.length > 0;
  // Avoid blocking UI when we already have products and are doing a background refresh.
  const controlsDisabled = isInitialLoading;

  return (
    <div>
      {header}

      <ProductListingToolbar
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={onSortChange}
        totalItems={total}
        currentPage={currentPage}
        itemsPerPage={pageSize}
        pageSizeOptions={pageSizeOptions}
        onItemsPerPageChange={onItemsPerPageChange}
        disabled={controlsDisabled}
      />

      <ProductList
        products={products}
        loading={!hasProducts && isLoading}
        initialLoading={isInitialLoading}
        error={hasError ? errorMessage : null}
        emptyLabel={emptyMessage}
      />

      <ProductListingPagination
        page={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        disabled={controlsDisabled}
      />
    </div>
  );
};

export default ListingPageContent;
