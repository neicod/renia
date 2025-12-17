// @env: mixed
import React from 'react';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type PageSizeSelectorProps = {
  options: number[];
  selectedValue: number;
  onChange: (nextPageSize: number) => void;
  disabled?: boolean;
};

/**
 * PageSizeSelector - Pure presentation component for page size dropdown
 *
 * Responsibility:
 * - Render page size dropdown with options
 * - Handle selection change (convert to number)
 * - Disable if only one option available
 * - Apply consistent styling
 *
 * Pure component: No logic beyond rendering and change handling
 */
export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({
  options,
  selectedValue,
  onChange,
  disabled
}) => {
  const { t } = useI18n();

  // Only show selector if multiple options available
  const showSelector = options && options.length > 1;

  if (!showSelector) {
    return null;
  }

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
        {t('catalog.listing.perPage')}:
      </span>
      <select
        value={String(selectedValue)}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        style={{
          padding: '0.45rem 0.9rem',
          borderRadius: '999px',
          border: '1px solid #d7def0',
          background: '#f8faff',
          color: '#0f172a',
          minWidth: '120px'
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

export default PageSizeSelector;
