// @env: mixed
import type { StoreConfig } from 'renia-magento-store';
import type { CatalogStorefrontConfig } from './storefrontConfig';

export const DEFAULT_PAGE_SIZE = 12;

/**
 * StorefrontConfigParser - Pure service for parsing storefront configuration
 *
 * Responsibility:
 * - Parse raw API data to config format
 * - Validate and normalize values
 * - Handle missing/malformed data gracefully
 *
 * Pure functions only - no side effects, no API calls
 */
export class StorefrontConfigParser {
  /**
   * Parse a single value to number
   * Handles: number, string, invalid formats
   *
   * @param value Unknown value from API
   * @returns Parsed number or undefined
   */
  static parseNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === 'string') {
      const parsed = Number(value.trim());
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  /**
   * Parse array/string of values
   * Converts: string (comma-separated) or array to number[]
   *
   * @param value Unknown value from API (string or array)
   * @returns Array of parsed numbers (only positive, finite values)
   */
  static parseValues(value: unknown): number[] {
    const entries: string[] = [];
    if (typeof value === 'string') {
      entries.push(...value.split(','));
    } else if (Array.isArray(value)) {
      entries.push(...value.map((entry) => (typeof entry === 'string' ? entry : String(entry ?? ''))));
    }
    return entries
      .map((entry) => this.parseNumber(entry))
      .filter((val): val is number => typeof val === 'number' && val > 0);
  }

  /**
   * Normalize array of values
   * - Remove duplicates (Set)
   * - Sort ascending
   * - Include fallback if provided
   * - Return default if empty
   *
   * @param values Array of page sizes
   * @param fallback Optional fallback value to include
   * @returns Normalized array (always non-empty)
   */
  static normalizeValues(values: number[], fallback?: number): number[] {
    const uniq = new Set<number>();
    values.forEach((val) => {
      if (Number.isFinite(val) && val > 0) {
        uniq.add(val);
      }
    });
    if (typeof fallback === 'number' && fallback > 0) {
      uniq.add(fallback);
    }
    const sorted = Array.from(uniq).sort((a, b) => a - b);
    return sorted.length ? sorted : [DEFAULT_PAGE_SIZE];
  }

  /**
   * Extract catalog storefront config from store config
   * Handles: grid_per_page (default page size), grid_per_page_values (options)
   *
   * @param store StoreConfig object
   * @returns CatalogStorefrontConfig or null if missing
   */
  static extract(store?: StoreConfig | null): CatalogStorefrontConfig | null {
    if (!store?.raw) return null;
    const raw = store.raw as Record<string, unknown>;
    const gridPerPage = this.parseNumber((raw as any)?.grid_per_page);
    const options = this.normalizeValues(this.parseValues((raw as any)?.grid_per_page_values), gridPerPage);
    return {
      gridPerPage,
      gridPerPageValues: options
    };
  }
}

export default StorefrontConfigParser;
