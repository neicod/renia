// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type Option = {
  value: string;
  label: string;
};

type Props = {
  options: Option[];
  selectedValue: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export const SortSelector: React.FC<Props> = ({ options, selectedValue, onChange, disabled }) => {
  const { t } = useI18n();
  if (!options?.length) return null;

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.9rem', color: '#475569' }}>{t('catalog.listing.sort')}</span>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          padding: '0.35rem 0.6rem',
          borderRadius: '10px',
          border: '1px solid #dbe3f5',
          background: disabled ? '#f1f5f9' : '#fff'
        }}
      >
        <option value="relevance">{t('catalog.listing.relevance')}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SortSelector;

