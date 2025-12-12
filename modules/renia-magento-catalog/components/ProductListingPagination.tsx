// @env: mixed
import React from 'react';

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export const ProductListingPagination: React.FC<Props> = ({
  page,
  pageSize,
  total,
  onPageChange,
  disabled
}) => {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  if (totalPages <= 1) {
      return null;
  }

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goTo = (next: number) => {
    const safe = Math.min(Math.max(next, 1), totalPages);
    onPageChange(safe);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginTop: '1.25rem',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ color: '#374151', fontSize: '0.95rem' }}>
        Page {page} of {totalPages}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={!canPrev || disabled}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            background: canPrev && !disabled ? '#fff' : '#f3f4f6',
            color: '#111827',
            cursor: canPrev && !disabled ? 'pointer' : 'not-allowed'
          }}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={!canNext || disabled}
          style={{
            padding: '0.5rem 0.9rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            background: canNext && !disabled ? '#fff' : '#f3f4f6',
            color: '#111827',
            cursor: canNext && !disabled ? 'pointer' : 'not-allowed'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductListingPagination;
