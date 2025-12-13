// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';

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
  const { t } = useI18n();

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
        marginTop: '1.5rem',
        flexWrap: 'wrap',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        boxShadow: '0 10px 18px rgba(15, 23, 42, 0.08)'
      }}
    >
      <div style={{ color: '#475569', fontSize: '0.9rem' }}>
        {t('catalog.pagination.page', { page, totalPages })}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={!canPrev || disabled}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            border: '1px solid #d6e0f5',
            background: canPrev && !disabled ? '#f7f9ff' : '#f1f5f9',
            color: '#1e3a8a',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: canPrev && !disabled ? 'pointer' : 'not-allowed'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('catalog.pagination.prev')}
        </button>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={!canNext || disabled}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            border: '1px solid #d6e0f5',
            background: canNext && !disabled ? '#eef6ff' : '#f1f5f9',
            color: '#1e3a8a',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: canNext && !disabled ? 'pointer' : 'not-allowed'
          }}
        >
          {t('catalog.pagination.next')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductListingPagination;
