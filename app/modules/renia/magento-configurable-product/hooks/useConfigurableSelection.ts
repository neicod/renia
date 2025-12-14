// @env: mixed
import React from 'react';
import type { ConfigurableProduct, ConfigurableVariant } from '../types';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type SelectedOptions = Record<string, number>; // attributeCode -> valueIndex

export type UseConfigurableSelectionResult = {
  selectedOptions: SelectedOptions;
  currentVariant: ConfigurableVariant | null;
  availableOptions: Record<string, Set<number>>;
  selectOption: (attributeCode: string, valueIndex: number) => void;
  isOptionDisabled: (attributeCode: string, valueIndex: number) => boolean;
  reset: () => void;
};

export const useConfigurableSelection = (product: ConfigurableProduct): UseConfigurableSelectionResult => {
  const [selectedOptions, setSelectedOptions] = React.useState<SelectedOptions>({});

  React.useEffect(() => {
    logger.debug('useConfigurableSelection', 'Hook initialized', {
      productSku: product.sku,
      optionsCount: product.configurableOptions?.length ?? 0,
      variantsCount: product.variants?.length ?? 0
    });
  }, [product.sku]);

  // Normalize product data (handle both camelCase typed and snake_case raw API data)
  const options = React.useMemo(() => {
    if (!product.configurableOptions) return [];
    const normalized = (product.configurableOptions as any[]).map(opt => ({
      attributeCode: opt.attribute_code ?? opt.attributeCode ?? '',
      values: (opt.values ?? []).map((v: any) => ({
        valueIndex: v.value_index ?? v.valueIndex ?? 0,
        label: v.label ?? ''
      }))
    }));
    logger.debug('useConfigurableSelection', 'Options normalized', {
      optionsCount: normalized.length,
      optionCodes: normalized.map(o => o.attributeCode)
    });
    return normalized;
  }, [product.configurableOptions]);

  const variants = React.useMemo(() => {
    if (!product.variants) return [];
    return (product.variants as any[]).map(v => ({
      product: {
        sku: v.product?.sku ?? ''
      },
      attributes: (v.attributes ?? []).map((a: any) => ({
        code: a.code ?? '',
        valueIndex: a.value_index ?? a.valueIndex ?? 0
      }))
    }));
  }, [product.variants]);

  // Find matching variant based on selected options
  const currentVariant = React.useMemo(() => {
    const requiredAttributes = options.map(opt => opt.attributeCode);
    const allSelected = requiredAttributes.every(code => selectedOptions[code] !== undefined);

    logger.debug('useConfigurableSelection', 'Finding variant', {
      requiredAttributes,
      selectedOptions,
      allSelected
    });

    if (!allSelected) {
      logger.debug('useConfigurableSelection', 'Not all attributes selected', {
        missing: requiredAttributes.filter(code => selectedOptions[code] === undefined)
      });
      return null;
    }

    const found = variants.find(variant =>
      variant.attributes.every(attr => selectedOptions[attr.code] === attr.valueIndex)
    ) ?? null;

    // Return in ConfigurableVariant format expected by UI
    if (found) {
      logger.debug('useConfigurableSelection', 'Variant found', {
        variantSku: found.product.sku,
        selectedOptions
      });
      return found as any as ConfigurableVariant;
    }
    logger.warn('useConfigurableSelection', 'No matching variant found', {
      selectedOptions,
      variantsCount: variants.length
    });
    return null;
  }, [options, variants, selectedOptions]);

  // Get available options (filter out combinations that don't exist)
  const availableOptions = React.useMemo(() => {
    const available: Record<string, Set<number>> = {};

    // Initialize with all values from configurable options
    options.forEach(opt => {
      available[opt.attributeCode] = new Set(opt.values.map(v => v.valueIndex));
    });

    // Filter based on current selection - only show values that have matching variants
    if (Object.keys(selectedOptions).length > 0) {
      const validOptions: Record<string, Set<number>> = {};
      options.forEach(opt => {
        validOptions[opt.attributeCode] = new Set();
      });

      // Find all variants that match current partial selection
      variants.forEach(variant => {
        const matchesSelection = variant.attributes.every(attr => {
          const selected = selectedOptions[attr.code];
          return selected === undefined || selected === attr.valueIndex;
        });

        if (matchesSelection) {
          variant.attributes.forEach(attr => {
            // Add this value to available options for this attribute
            validOptions[attr.code]?.add(attr.valueIndex);
          });
        }
      });

      return validOptions;
    }

    return available;
  }, [options, variants, selectedOptions]);

  const selectOption = React.useCallback((attributeCode: string, valueIndex: number) => {
    logger.debug('useConfigurableSelection', 'Selecting option', {
      attributeCode,
      valueIndex
    });
    setSelectedOptions(prev => {
      const updated = {
        ...prev,
        [attributeCode]: valueIndex
      };
      logger.debug('useConfigurableSelection', 'Selected options updated', { updated });
      return updated;
    });
  }, []);

  const isOptionDisabled = React.useCallback(
    (attributeCode: string, valueIndex: number) => {
      return !availableOptions[attributeCode]?.has(valueIndex);
    },
    [availableOptions]
  );

  const reset = React.useCallback(() => {
    setSelectedOptions({});
  }, []);

  return {
    selectedOptions,
    currentVariant,
    availableOptions,
    selectOption,
    isOptionDisabled,
    reset
  };
};

export default useConfigurableSelection;
