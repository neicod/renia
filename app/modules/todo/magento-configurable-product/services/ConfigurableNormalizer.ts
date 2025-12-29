// @env: mixed
import { getLogger } from 'renia-logger';
import type { ConfigurableProduct, ConfigurableVariant } from '../types';

const logger = getLogger();

/**
 * Normalized option representation (handle camelCase vs snake_case API variance)
 */
export type NormalizedOption = {
  attributeCode: string;
  values: Array<{
    valueIndex: number;
    label: string;
  }>;
};

/**
 * Normalized variant representation
 */
export type NormalizedVariant = {
  product: {
    sku: string;
  };
  attributes: Array<{
    code: string;
    valueIndex: number;
  }>;
};

/**
 * ConfigurableNormalizer - Pure service for data normalization
 *
 * Responsibility:
 * - Handle both camelCase typed and snake_case raw API data
 * - Convert to normalized format for internal use
 * - Handle missing/malformed data gracefully
 *
 * No hooks, no side effects - pure functions only
 */
export class ConfigurableNormalizer {
  /**
   * Normalize configurable options from product
   * Handles: attribute_code vs attributeCode, value_index vs valueIndex
   *
   * @param product ConfigurableProduct
   * @returns Normalized options or empty array if missing
   */
  static normalizeOptions(product: ConfigurableProduct): NormalizedOption[] {
    if (!product.configurableOptions) {
      logger.warn('ConfigurableNormalizer', 'No configurableOptions in product', {
        sku: product.sku
      });
      return [];
    }

    const normalized = (product.configurableOptions as any[]).map((opt) => ({
      attributeCode: opt.attribute_code ?? opt.attributeCode ?? '',
      values: (opt.values ?? []).map((v: any) => ({
        valueIndex: v.value_index ?? v.valueIndex ?? 0,
        label: v.label ?? ''
      }))
    }));

    return normalized;
  }

  /**
   * Normalize variants from product
   * Handles: value_index vs valueIndex, missing attributes
   *
   * @param product ConfigurableProduct
   * @returns Normalized variants or empty array if missing
   */
  static normalizeVariants(product: ConfigurableProduct): NormalizedVariant[] {
    if (!product.variants) {
      logger.warn('ConfigurableNormalizer', 'No variants in product', {
        sku: product.sku
      });
      return [];
    }

    const mapped = (product.variants as any[]).map((v) => ({
      product: {
        sku: v.product?.sku ?? ''
      },
      attributes: (v.attributes ?? []).map((a: any) => ({
        code: a.code ?? '',
        valueIndex: a.value_index ?? a.valueIndex ?? 0
      }))
    }));

    return mapped;
  }
}

export default ConfigurableNormalizer;
