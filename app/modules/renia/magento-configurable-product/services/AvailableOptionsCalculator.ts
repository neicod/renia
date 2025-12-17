// @env: mixed
import type { NormalizedOption, NormalizedVariant } from './ConfigurableNormalizer';

type SelectedOptions = Record<string, number>; // attributeCode -> valueIndex

/**
 * AvailableOptionsCalculator - Pure service for calculating available options
 *
 * Responsibility:
 * - Calculate which option values are available (not disabled)
 * - Filter based on current selection to prevent invalid combinations
 * - Handle initial state (no selection) vs partial selection
 *
 * No hooks, no state - pure functions only
 */
export class AvailableOptionsCalculator {
  /**
   * Calculate available options based on current selection
   *
   * Algorithm:
   * 1. If no selection: all values from options are available
   * 2. If partial selection:
   *    - Find all variants matching current selection
   *    - Collect all option values from matching variants
   *    - Only these values are available for other attributes
   *
   * This prevents showing values that would create invalid variant combinations
   *
   * @param options Available options from product config
   * @param variants Available variants
   * @param selectedOptions Current user selections
   * @returns Map of attributeCode -> Set<valueIndex> (available values)
   */
  static calculate(
    options: NormalizedOption[],
    variants: NormalizedVariant[],
    selectedOptions: SelectedOptions
  ): Record<string, Set<number>> {
    // Initialize with all values from options
    const available: Record<string, Set<number>> = {};
    options.forEach((opt) => {
      available[opt.attributeCode] = new Set(opt.values.map((v) => v.valueIndex));
    });

    // If no selection yet, return all available
    if (Object.keys(selectedOptions).length === 0) {
      return available;
    }

    // Calculate which values are valid with current selection
    const validOptions: Record<string, Set<number>> = {};
    options.forEach((opt) => {
      validOptions[opt.attributeCode] = new Set();
    });

    // Find all variants that match current partial selection
    variants.forEach((variant) => {
      // Check if variant matches all currently selected attributes
      // (ignoring attributes we haven't selected yet)
      const matchesSelection = variant.attributes.every((attr) => {
        const selected = selectedOptions[attr.code];
        // undefined = not selected yet, so don't filter by it
        // Otherwise must match exactly
        return selected === undefined || selected === attr.valueIndex;
      });

      if (matchesSelection) {
        // Add this variant's option values to available set
        variant.attributes.forEach((attr) => {
          validOptions[attr.code]?.add(attr.valueIndex);
        });
      }
    });

    return validOptions;
  }
}

export default AvailableOptionsCalculator;
