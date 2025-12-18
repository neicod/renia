// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type Props = {
  options: number[];
  selectedValue: number;
  onChange: (next: number) => void;
  disabled?: boolean;
};

export const PageSizeSelector: React.FC<Props> = ({ options, selectedValue, onChange, disabled }) => {
  const { t } = useI18n();
  if (!options?.length) return null;

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.9rem', color: '#475569' }}>{t('catalog.listing.perPage')}</span>
      <select
        value={selectedValue}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{
          padding: '0.35rem 0.6rem',
          borderRadius: '10px',
          border: '1px solid #dbe3f5',
          background: disabled ? '#f1f5f9' : '#fff'
        }}
      >
        {options.map((val) => (
          <option key={val} value={val}>
            {val}
          </option>
        ))}
      </select>
    </label>
  );
};

export default PageSizeSelector;

