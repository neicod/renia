// @env: mixed
import React from 'react';
import type { ConfigurableOptionValue } from '../types';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  value: ConfigurableOptionValue;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export const SwatchButton: React.FC<Props> = ({ value, selected, disabled, onClick }) => {
  const handleClick = () => {
    if (!disabled) {
      logger.debug('SwatchButton', 'Clicked', {
        valueIndex: value.valueIndex,
        label: value.label,
        swatchType: value.swatchData?.type
      });
      onClick();
    }
  };

  const getSwatchColor = (): string | undefined => {
    if (value.swatchData?.type === 'COLOR') {
      return value.swatchData.value;
    }
    return undefined;
  };

  const isImageSwatch = value.swatchData?.type === 'IMAGE';
  const color = getSwatchColor();

  const baseStyle: React.CSSProperties = {
    padding: '0.5rem',
    borderRadius: '0.5rem',
    border: selected ? '2px solid #2563eb' : '1px solid #cbd5f5',
    background: color ?? '#f1f5f9',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    minWidth: '2.5rem',
    minHeight: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 120ms ease',
    fontSize: color ? 'transparent' : '0.875rem',
    fontWeight: 500,
    color: color ? undefined : '#1e293b'
  };

  if (isImageSwatch) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={selected}
        title={value.label}
        style={{
          ...baseStyle,
          backgroundImage: `url(${value.swatchData?.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      title={value.label}
      style={baseStyle}
    >
      {!color && value.label}
    </button>
  );
};

export default SwatchButton;
