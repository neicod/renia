// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type Props = {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  pageSizeOptions: number[];
  onItemsPerPageChange: (next: number) => void;
};

export const WishlistToolbar: React.FC<Props> = ({
  totalItems,
  currentPage,
  itemsPerPage,
  pageSizeOptions,
  onItemsPerPageChange
}) => {
  const { t } = useI18n();

  const start = totalItems ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0;
  const end = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;
  const perPageOptions = pageSizeOptions?.length ? pageSizeOptions : [itemsPerPage];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        marginTop: '1rem',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        background: '#fff'
      }}
    >
      <div style={{ color: '#475569', fontSize: '0.9rem' }}>
        {t('catalog.listing.showing', { start, end, total: totalItems })}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', color: '#475569' }}>{t('catalog.listing.perPage')}</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            padding: '0.35rem 0.6rem',
            borderRadius: '10px',
            border: '1px solid #dbe3f5',
            background: '#fff'
          }}
        >
          {perPageOptions.map((val) => (
            <option key={val} value={val}>
              {val}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default WishlistToolbar;

