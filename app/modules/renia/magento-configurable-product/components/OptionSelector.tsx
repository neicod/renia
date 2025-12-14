// @env: mixed
import React from 'react';
import type { ConfigurableOption } from '../types';
import { SwatchButton } from './SwatchButton';
import { DropdownSelector } from './DropdownSelector';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  option: ConfigurableOption;
  selectedValue?: number;
  onSelect: (valueIndex: number) => void;
  isValueDisabled: (valueIndex: number) => boolean;
};

export const OptionSelector: React.FC<Props> = ({
  option,
  selectedValue,
  onSelect,
  isValueDisabled
}) => {
  const hasSwatches = option.values.some(v => v.swatchData);
  const selectedLabel = selectedValue !== undefined ? option.values.find(v => v.valueIndex === selectedValue)?.label : undefined;

  React.useEffect(() => {
    logger.debug('OptionSelector', 'Rendering option', {
      optionCode: option.attributeCode,
      selectedValue,
      selectedLabel,
      valuesCount: option.values.length,
      hasSwatches
    });
  }, [option.attributeCode, selectedValue, selectedLabel, option.values.length, hasSwatches]);

  return (
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <label style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b' }}>
        {option.label}
        {selectedLabel && (
          <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '0.5rem' }}>
            ({selectedLabel})
          </span>
        )}
      </label>

      {hasSwatches ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {option.values.map(value => (
            <SwatchButton
              key={value.valueIndex}
              value={value}
              selected={selectedValue === value.valueIndex}
              disabled={isValueDisabled(value.valueIndex)}
              onClick={() => onSelect(value.valueIndex)}
            />
          ))}
        </div>
      ) : (
        <DropdownSelector
          values={option.values}
          selectedValue={selectedValue}
          onSelect={onSelect}
          isValueDisabled={isValueDisabled}
        />
      )}
    </div>
  );
};

export default OptionSelector;
