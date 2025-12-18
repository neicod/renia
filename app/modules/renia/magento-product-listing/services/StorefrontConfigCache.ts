// @env: mixed
import type { CatalogStorefrontConfig } from './storefrontConfig';

export class StorefrontConfigCache {
  private cache: CatalogStorefrontConfig | null = null;
  private inFlight: Promise<CatalogStorefrontConfig> | null = null;

  get(): CatalogStorefrontConfig | null {
    return this.cache;
  }

  set(value: CatalogStorefrontConfig): void {
    this.cache = value;
  }

  clear(): void {
    this.cache = null;
  }

  getInFlight(): Promise<CatalogStorefrontConfig> | null {
    return this.inFlight;
  }

  setInFlight(promise: Promise<CatalogStorefrontConfig>): void {
    this.inFlight = promise;
  }

  clearInFlight(): void {
    this.inFlight = null;
  }
}

export const storefrontConfigCache = new StorefrontConfigCache();

export default StorefrontConfigCache;

