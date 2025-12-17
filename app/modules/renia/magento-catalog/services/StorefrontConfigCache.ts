// @env: mixed
import type { CatalogStorefrontConfig } from './storefrontConfig';

/**
 * StorefrontConfigCache - Simple in-memory cache service
 *
 * Responsibility:
 * - Store and retrieve config from memory
 * - Track in-flight requests to prevent duplicates
 * - Support cache invalidation (forceRefresh)
 *
 * Future: Can be extended with localStorage, sessionStorage, etc.
 */
export class StorefrontConfigCache {
  private cache: CatalogStorefrontConfig | null = null;
  private inFlight: Promise<CatalogStorefrontConfig> | null = null;

  /**
   * Get cached value
   */
  get(): CatalogStorefrontConfig | null {
    return this.cache;
  }

  /**
   * Set cached value
   */
  set(value: CatalogStorefrontConfig): void {
    this.cache = value;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache = null;
  }

  /**
   * Get in-flight promise (to prevent duplicate requests)
   */
  getInFlight(): Promise<CatalogStorefrontConfig> | null {
    return this.inFlight;
  }

  /**
   * Set in-flight promise
   */
  setInFlight(promise: Promise<CatalogStorefrontConfig>): void {
    this.inFlight = promise;
  }

  /**
   * Clear in-flight promise
   */
  clearInFlight(): void {
    this.inFlight = null;
  }
}

// Singleton instance
export const storefrontConfigCache = new StorefrontConfigCache();

export default StorefrontConfigCache;
