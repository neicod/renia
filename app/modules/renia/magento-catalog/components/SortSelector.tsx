// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type SortOption = {
  value: string;
  label: string;
};

type SortSelectorProps = {
  options: SortOption[];
  selectedValue: string;
  onChange: (nextSort: string) => void;
  disabled?: boolean;
};

/**
 * SortSelector - Pure presentation component for sort dropdown
 *
 * Responsibility:
 * - Render sort dropdown with options
 * - Handle selection change
 * - Apply consistent styling
 *
 * Pure component: No logic beyond rendering and change handling
 */
export const SortSelector: React.FC<SortSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  disabled
}) => {
  const { t } = useI18n();

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem'
      }}
    >
      <span
        style={{
          color: '#64748b',
          fontSize: '0.9rem'
        }}
      >
        {t('catalog.listing.sort')}:
      </span>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SortSelector;
