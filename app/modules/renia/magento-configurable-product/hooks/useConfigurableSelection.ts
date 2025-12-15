// @env: mixed
import React from 'react';
import { getLogger } from 'renia-logger';
import type { ConfigurableProduct, ConfigurableVariant } from '../types';

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


  // Normalize product data (handle both camelCase typed and snake_case raw API data)
  const options = React.useMemo(() => {
    if (!product.configurableOptions) {
      logger.warn('useConfigurableSelection', 'No configurableOptions in product', { sku: product.sku });
      return [];
    }
    const normalized = (product.configurableOptions as any[]).map(opt => ({
      attributeCode: opt.attribute_code ?? opt.attributeCode ?? '',
      values: (opt.values ?? []).map((v: any) => ({
        valueIndex: v.value_index ?? v.valueIndex ?? 0,
        label: v.label ?? ''
      }))
    }));
    return normalized;
  }, [product.configurableOptions]);

  const variants = React.useMemo(() => {
    if (!product.variants) {
      logger.warn('useConfigurableSelection', 'No variants in product', { sku: product.sku });
      return [];
    }
    const mapped = (product.variants as any[]).map(v => ({
      product: {
        sku: v.product?.sku ?? ''
      },
      attributes: (v.attributes ?? []).map((a: any) => ({
        code: a.code ?? '',
        valueIndex: a.value_index ?? a.valueIndex ?? 0
      }))
    }));
    return mapped;
  }, [product.variants]);

  // Find matching variant based on selected options
  const currentVariant = React.useMemo(() => {
    const requiredAttributes = options.map(opt => opt.attributeCode);
    const allSelected = requiredAttributes.every(code => selectedOptions[code] !== undefined);

    if (!allSelected) {
      return null;
    }

    const found = variants.find(variant => {
      const match = variant.attributes.every(attr => selectedOptions[attr.code] === attr.valueIndex);
      return match;
    }) ?? null;

    if (!found) {
      logger.warn('useConfigurableSelection', 'No variant found for selection', {
        selectedOptions,
        variantsCount: variants.length
      });
    }

    // Return in ConfigurableVariant format expected by UI
    if (found) {
      logger.info('useConfigurableSelection', 'Variant found', { sku: found.product.sku });
      return found as any as ConfigurableVariant;
    }
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
    setSelectedOptions(prev => {
      // If clicking same value, toggle it off (deselect)
      if (prev[attributeCode] === valueIndex) {
        const updated = { ...prev };
        delete updated[attributeCode];
        return updated;
      }
      // Otherwise, select the new value
      return {
        ...prev,
        [attributeCode]: valueIndex
      };
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
