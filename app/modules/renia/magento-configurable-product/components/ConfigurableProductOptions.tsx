// @env: mixed
import React from 'react';
import type { ConfigurableProduct } from '../types';
import { useConfigurableSelection } from '../hooks/useConfigurableSelection';
import { OptionSelector } from './OptionSelector';
import { SelectedVariantSummary } from './SelectedVariantSummary';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type Props = {
  product: ConfigurableProduct;
  onVariantChange?: (variantSku: string | null) => void;
};

export const ConfigurableProductOptions: React.FC<Props> = ({ product, onVariantChange }) => {
  const { selectedOptions, currentVariant, selectOption, isOptionDisabled } =
    useConfigurableSelection(product);

  React.useEffect(() => {
    logger.debug('ConfigurableProductOptions', 'Variant changed', {
      productSku: product.sku,
      currentVariantSku: currentVariant?.product.sku ?? null,
      selectedOptions
    });
    onVariantChange?.(currentVariant?.product.sku ?? null);
  }, [currentVariant, onVariantChange, product.sku]);

  logger.debug('ConfigurableProductOptions', 'Rendering', {
    productSku: product.sku,
    optionsCount: product.configurableOptions.length,
    currentVariantSku: currentVariant?.product.sku ?? null
  });

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
