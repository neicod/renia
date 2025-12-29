// @env: mixed
import { getLogger } from 'renia-logger';
import type { ConfigurableVariant } from '../types';
import type { NormalizedOption, NormalizedVariant } from './ConfigurableNormalizer';

const logger = getLogger();

type SelectedOptions = Record<string, number>; // attributeCode -> valueIndex

/**
 * VariantMatcher - Pure service for variant matching algorithm
 *
 * Responsibility:
 * - Find variant matching current option selection
 * - Validate that all required attributes are selected
 * - Return matching variant or null
 *
 * No hooks, no state - pure functions only
 * No logging side effects - just return results
 */
export class VariantMatcher {
  /**
   * Check if all required attributes are selected
   *
   * @param options Available options from product config
   * @param selectedOptions Current user selections
   * @returns true if all required attributes have values
   */
  static isComplete(options: NormalizedOption[], selectedOptions: SelectedOptions): boolean {
    const requiredAttributes = options.map((opt) => opt.attributeCode);
    return requiredAttributes.every((code) => selectedOptions[code] !== undefined);
  }

  /**
   * Find variant matching current selections
   *
   * Algorithm:
   * 1. Check if all required attributes selected
   * 2. Search variants for exact match on selected attributes
   * 3. Return ConfigurableVariant format or null
   *
   * @param options Available options from product config
   * @param variants Available variants
   * @param selectedOptions Current user selections
   * @returns Matching variant or null
   */
  static findMatching(
    options: NormalizedOption[],
    variants: NormalizedVariant[],
    selectedOptions: SelectedOptions
  ): ConfigurableVariant | null {
    // Check if selection is complete
    if (!this.isComplete(options, selectedOptions)) {
      return null;
    }

    // Find variant where all attributes match selected values
    const found = variants.find((variant) => {
      return variant.attributes.every((attr) => selectedOptions[attr.code] === attr.valueIndex);
    }) ?? null;

    if (!found) {
      logger.warn('VariantMatcher', 'No variant found for selection', {
        selectedOptions,
        variantsCount: variants.length
      });
      return null;
    }

    logger.info('VariantMatcher', 'Variant found', { sku: found.product.sku });

    // Return in ConfigurableVariant format expected by UI
    return (found as any) as ConfigurableVariant;
  }
}

export default VariantMatcher;
