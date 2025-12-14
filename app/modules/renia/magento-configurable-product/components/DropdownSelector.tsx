// @env: mixed
import React from 'react';
import type { ConfigurableOptionValue } from '../types';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  values: ConfigurableOptionValue[];
  selectedValue?: number;
  onSelect: (valueIndex: number) => void;
  isValueDisabled: (valueIndex: number) => boolean;
};

export const DropdownSelector: React.FC<Props> = ({ values, selectedValue, onSelect, isValueDisabled }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      const valueIndex = Number(val);
      onSelect(valueIndex);
    }
  };

  return (
    <select
      value={selectedValue ?? ''}
      onChange={handleChange}
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: '0.5rem',
        border: '1px solid #cbd5f5',
        background: '#fff',
        cursor: 'pointer',
        minWidth: '100%',
        fontSize: '0.95rem',
        fontFamily: 'inherit'
      }}
    >
      <option value="">— Select —</option>
      {values.map(value => (
        <option
          key={value.valueIndex}
          value={value.valueIndex}
          disabled={isValueDisabled(value.valueIndex)}
        >
          {value.label}
        </option>
      ))}
    </select>
  );
};

export default DropdownSelector;
