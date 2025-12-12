// @env: mixed
import React from 'react';

type SortOption = {
  value: string;
  label: string;
};

type Props = {
  sortOptions: SortOption[];
  value: string;
  onChange: (value: string) => void;
  total?: number;
  page: number;
  pageSize: number;
  disabled?: boolean;
};

export const ProductListingToolbar: React.FC<Props> = ({
  sortOptions,
  value,
  onChange,
  total,
  page,
  pageSize,
  disabled
}) => {
  const start = total ? Math.min((page - 1) * pageSize + 1, total) : 0;
  const end = total ? Math.min(page * pageSize, total) : 0;

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
        {total ? `Showing ${start}–${end} of ${total} products` : 'Products'}
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#374151', fontSize: '0.95rem' }}>Sort by:</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
    </div>
  );
};

export default ProductListingToolbar;
