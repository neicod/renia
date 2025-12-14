// @env: mixed
import React from 'react';
import type { ConfigurableProduct } from '../types';
import { useConfigurableSelection } from '../hooks/useConfigurableSelection';
import { OptionSelector } from './OptionSelector';
import { SelectedVariantSummary } from './SelectedVariantSummary';

type Props = {
  product: ConfigurableProduct;
  onVariantChange?: (variantSku: string | null) => void;
};

export const ConfigurableProductOptions: React.FC<Props> = ({ product, onVariantChange }) => {
  const { selectedOptions, currentVariant, selectOption, isOptionDisabled } =
    useConfigurableSelection(product);

  React.useEffect(() => {
    onVariantChange?.(currentVariant?.product.sku ?? null);
  }, [currentVariant, onVariantChange]);

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {product.configurableOptions
        .sort((a, b) => a.position - b.position)
        .map(option => (
          <OptionSelector
            key={option.attributeCode}
            option={option}
            selectedValue={selectedOptions[option.attributeCode]}
            onSelect={valueIndex => selectOption(option.attributeCode, valueIndex)}
            isValueDisabled={valueIndex => isOptionDisabled(option.attributeCode, valueIndex)}
          />
        ))}

      {currentVariant && <SelectedVariantSummary variant={currentVariant} />}
    </div>
  );
};

export default ConfigurableProductOptions;
