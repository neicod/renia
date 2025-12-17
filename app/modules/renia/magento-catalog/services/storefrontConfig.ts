// @env: mixed
import type { StoreConfig } from 'renia-magento-store';
import { storefrontConfigCache } from './StorefrontConfigCache';
import StorefrontConfigParser, { DEFAULT_PAGE_SIZE } from './StorefrontConfigParser';
import StorefrontConfigRepository from './StorefrontConfigRepository';

export const { DEFAULT_PAGE_SIZE } = StorefrontConfigParser;

export type CatalogStorefrontConfig = {
  gridPerPage?: number;
  gridPerPageValues: number[];
};

/**
 * storefrontConfig.ts - Orchestrator for storefront configuration
 *
 * RESPONSIBILITY: ONLY orchestration - composes services with cache strategy
 *
 * Composes:
 * - StorefrontConfigCache - In-memory cache (prevent duplicate fetches)
 * - StorefrontConfigRepository - GraphQL data fetching
 * - StorefrontConfigParser - Data parsing and normalization
 *
 * Changes from previous version:
 * - Extracted caching logic → StorefrontConfigCache.ts
 * - Extracted fetching logic → StorefrontConfigRepository.ts
 * - Extracted parsing logic → StorefrontConfigParser.ts
 * - This file now: ~55 lines (was 121)
 * - Each service: Single, clear responsibility (SRP++)
 * - Public API unchanged - backward compatible
 *
 * @param store Optional StoreConfig from SSR
 * @returns CatalogStorefrontConfig or cached/fetched value
 */
export const extractCatalogStorefrontConfig = (
  store?: StoreConfig | null
): CatalogStorefrontConfig | null => {
  return StorefrontConfigParser.extract(store);
};

/**
 * Get catalog storefront config with multi-level caching
 *
 * Strategy:
 * 1. Try to extract from provided store (SSR data)
 * 2. Try to return from cache (if fresh)
 * 3. Try to return in-flight request (prevent duplicate fetches)
 * 4. Fetch from GraphQL API
 *
 * @param options Configuration options
 *   - forceRefresh: Bypass cache, always fetch
 *   - store: SSR preloaded store config
 * @returns CatalogStorefrontConfig (never throws)
 */
export const getCatalogStorefrontConfig = async (
  options: { forceRefresh?: boolean; store?: StoreConfig | null } = {}
): Promise<CatalogStorefrontConfig> => {
  // 1. Check SSR store data first (highest priority)
  const fromStore = extractCatalogStorefrontConfig(options.store);
  if (fromStore) {
    storefrontConfigCache.set(fromStore);
    return fromStore;
  }

  // 2. Check cache (unless forcing refresh)
  if (!options.forceRefresh) {
    const cached = storefrontConfigCache.get();
    if (cached) {
      return cached;
    }
  }

  // 3. Check in-flight request (prevent duplicate fetches)
  let inFlight = storefrontConfigCache.getInFlight();
  if (!inFlight) {
    // 4. Fetch from repository and cache result
    inFlight = StorefrontConfigRepository.fetch().then((config) => {
      storefrontConfigCache.set(config);
      return config;
    });
    storefrontConfigCache.setInFlight(inFlight);

    // Clear in-flight after completion
    inFlight.finally(() => {
      storefrontConfigCache.clearInFlight();
    });
  }

  return inFlight;
};

export default {
  getCatalogStorefrontConfig,
  extractCatalogStorefrontConfig
};
