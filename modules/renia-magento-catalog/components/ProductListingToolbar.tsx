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
        marginBottom: '1.25rem',
        padding: '0.9rem 1.1rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        boxShadow: '0 10px 20px rgba(15, 23, 42, 0.08)'
      }}
    >
      <div style={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 500 }}>
        {totalItems ? `Pokazuję ${start}–${end} z ${totalItems} produktów` : 'Produkty'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Sortuj:</span>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            disabled={disabled}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid #d7def0',
              background: '#f8faff',
              color: '#0f172a',
              minWidth: '170px'
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Na stronę:</span>
          <select
            value={String(itemsPerPage)}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            disabled={disabled || perPageOptions.length <= 1}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid #d7def0',
              background: '#f8faff',
              color: '#0f172a',
              minWidth: '120px'
            }}
          >
            {perPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default ProductListingToolbar;
