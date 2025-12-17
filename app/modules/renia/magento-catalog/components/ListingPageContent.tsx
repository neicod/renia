// @env: mixed
import React from 'react';
import { ProductList } from 'magento-product/components/ProductList';
import { ProductListingToolbar } from './ProductListingToolbar';
import { ProductListingPagination } from './ProductListingPagination';
import type { Product } from 'magento-product';

export type ListingPageContentProps = {
  // Listing data
  products: Product[];
  total: number;
  currentPage: number;
  pageSize: number;

  // Sort
  sortOptions: Array<{ value: string; label: string }>;
  selectedSort: string;
  onSortChange: (nextSort: string) => void;

  // Pagination
  pageSizeOptions: number[];
  onItemsPerPageChange: (nextPageSize: number) => void;
  onPageChange: (nextPage: number) => void;

  // Status
  isLoading: boolean;
  isInitialLoading: boolean;
  hasError: boolean;

  // Translations
  errorMessage: string;
  emptyMessage: string;

  // Custom header (rendered above toolbar)
  header?: React.ReactNode;
};

/**
 * ListingPageContent - Shared listing page orchestrator
 *
 * Responsibility:
 * - Render complete listing page (toolbar + products + pagination)
 * - Handle loading/error/empty states
 * - Render custom header if provided
 *
 * Pure composition: No business logic, only rendering
 */
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
  const controlsDisabled = isLoading;

  return (
    <div>
      {/* Custom header (category title, search results title, etc.) */}
      {header}

      {/* Toolbar (sort + page size) */}
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

      {/* Product grid or loading/error/empty */}
      <ProductList
        products={products}
        loading={isLoading}
        initialLoading={isInitialLoading}
        error={hasError ? errorMessage : null}
        emptyLabel={emptyMessage}
      />

      {/* Pagination */}
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
