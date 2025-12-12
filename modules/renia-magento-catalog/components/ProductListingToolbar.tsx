// @env: mixed
import React from 'react';

type SortOption = {
  value: string;
  label: string;
};

type Props = {
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (nextSort: string) => void;
  totalItems?: number;
  currentPage: number;
  itemsPerPage: number;
  pageSizeOptions: number[];
  onItemsPerPageChange: (nextPageSize: number) => void;
  disabled?: boolean;
};

export const ProductListingToolbar: React.FC<Props> = ({
  sortOptions,
  selectedSort,
  onSortChange,
  totalItems,
  currentPage,
  itemsPerPage,
  pageSizeOptions,
  onItemsPerPageChange,
  disabled
}) => {
  const start = totalItems ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0;
  const end = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;
  const perPageOptions =
    pageSizeOptions && pageSizeOptions.length ? pageSizeOptions : [itemsPerPage];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        marginBottom: '1rem'
      }}
    >
      <div style={{ color: '#374151', fontSize: '0.95rem' }}>
        {totalItems ? `Showing ${start}–${end} of ${totalItems} products` : 'Products'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#374151', fontSize: '0.95rem' }}>Sort by:</span>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            disabled={disabled}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              background: disabled ? '#f9fafb' : '#fff',
              color: '#111827',
              minWidth: '180px'
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: '#374151', fontSize: '0.95rem' }}>Items per page:</span>
          <select
            value={String(itemsPerPage)}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={disabled || perPageOptions.length <= 1}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              background: disabled ? '#f9fafb' : '#fff',
              color: '#111827',
              minWidth: '140px'
            }}
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default ProductListingToolbar;
