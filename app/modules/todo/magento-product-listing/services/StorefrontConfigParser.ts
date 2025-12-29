// @env: mixed
import type { StoreConfig } from 'renia-magento-store';
import type { CatalogStorefrontConfig } from './storefrontConfig';

export const DEFAULT_PAGE_SIZE = 12;

export class StorefrontConfigParser {
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

