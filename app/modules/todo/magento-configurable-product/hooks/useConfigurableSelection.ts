// @env: mixed
import React from 'react';
import type { ConfigurableProduct, ConfigurableVariant } from '../types';
import ConfigurableNormalizer from '../services/ConfigurableNormalizer';
import VariantMatcher from '../services/VariantMatcher';
import AvailableOptionsCalculator from '../services/AvailableOptionsCalculator';

type SelectedOptions = Record<string, number>; // attributeCode -> valueIndex

export type UseConfigurableSelectionResult = {
  selectedOptions: SelectedOptions;
  currentVariant: ConfigurableVariant | null;
  availableOptions: Record<string, Set<number>>;
  selectOption: (attributeCode: string, valueIndex: number) => void;
  isOptionDisabled: (attributeCode: string, valueIndex: number) => boolean;
  reset: () => void;
};

/**
 * useConfigurableSelection - Orchestrator hook for configurable product selection
 *
 * RESPONSIBILITY: ONLY orchestration - composes services and manages state
 *
 * Composes:
 * - ConfigurableNormalizer - Normalize product data (camelCase vs snake_case)
 * - VariantMatcher - Find matching variant for selections
 * - AvailableOptionsCalculator - Calculate valid option values
 *
 * Changes from previous version:
 * - Extracted normalization logic → ConfigurableNormalizer.ts
 * - Extracted variant matching logic → VariantMatcher.ts
 * - Extracted availability calculation → AvailableOptionsCalculator.ts
 * - This file now: ~60 lines (was 159)
 * - Public API unchanged - backward compatible
 * - Each service: Testable independently (pure functions)
 *
 * @param product ConfigurableProduct
 * @returns Selection state and handlers
 */
export const useConfigurableSelection = (product: ConfigurableProduct): UseConfigurableSelectionResult => {
  const [selectedOptions, setSelectedOptions] = React.useState<SelectedOptions>({});

  // Normalize product data (camelCase vs snake_case API variance)
  const options = React.useMemo(() => {
    return ConfigurableNormalizer.normalizeOptions(product);
  }, [product.configurableOptions]);

  const variants = React.useMemo(() => {
    return ConfigurableNormalizer.normalizeVariants(product);
  }, [product.variants]);

  // Find matching variant based on selected options
  const currentVariant = React.useMemo(() => {
    return VariantMatcher.findMatching(options, variants, selectedOptions);
  }, [options, variants, selectedOptions]);

  // Calculate available options based on current selection
  const availableOptions = React.useMemo(() => {
    return AvailableOptionsCalculator.calculate(options, variants, selectedOptions);
  }, [options, variants, selectedOptions]);

  const selectOption = React.useCallback((attributeCode: string, valueIndex: number) => {
    setSelectedOptions((prev) => {
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
