// @env: mixed
import React from 'react';
import type { ConfigurableProduct } from '../types';
import { useConfigurableSelection } from '../hooks/useConfigurableSelection';
import type { UseConfigurableSelectionResult } from '../hooks/useConfigurableSelection';
import { OptionSelector } from './OptionSelector';
import { SelectedVariantSummary } from './SelectedVariantSummary';

type Props = {
  product: ConfigurableProduct;
  onVariantChange?: (variantSku: string | null) => void;
  // Optional: if parent provides selection state, use it instead of hook
  selectedOptions?: Record<string, number>;
  selectOption?: (attributeCode: string, valueIndex: number) => void;
  isOptionDisabled?: (attributeCode: string, valueIndex: number) => boolean;
  currentVariant?: UseConfigurableSelectionResult['currentVariant'];
};

export const ConfigurableProductOptions: React.FC<Props> = ({
  product,
  onVariantChange,
  selectedOptions: propsSelectedOptions,
  selectOption: propsSelectOption,
  isOptionDisabled: propsIsOptionDisabled,
  currentVariant: propsCurrentVariant
}) => {
  // Use provided state from parent, or fall back to hook if not provided
  const hookResult = useConfigurableSelection(product);
  const selectedOptions = propsSelectedOptions ?? hookResult.selectedOptions;
  const selectOption = propsSelectOption ?? hookResult.selectOption;
  const isOptionDisabled = propsIsOptionDisabled ?? hookResult.isOptionDisabled;
  const currentVariant = propsCurrentVariant ?? hookResult.currentVariant;

  React.useEffect(() => {
    onVariantChange?.(currentVariant?.product.sku ?? null);
  }, [currentVariant, onVariantChange, product.sku]);

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
