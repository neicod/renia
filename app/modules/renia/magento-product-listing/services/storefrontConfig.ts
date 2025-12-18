// @env: mixed
import type { StoreConfig } from 'renia-magento-store';
import { storefrontConfigCache } from './StorefrontConfigCache';
import StorefrontConfigParser, { DEFAULT_PAGE_SIZE } from './StorefrontConfigParser';
import StorefrontConfigRepository from './StorefrontConfigRepository';

export { DEFAULT_PAGE_SIZE };

export type CatalogStorefrontConfig = {
  gridPerPage?: number;
  gridPerPageValues: number[];
};

export const extractCatalogStorefrontConfig = (
  store?: StoreConfig | null
): CatalogStorefrontConfig | null => {
  return StorefrontConfigParser.extract(store);
};

export const getCatalogStorefrontConfig = async (
  options: { forceRefresh?: boolean; store?: StoreConfig | null } = {}
): Promise<CatalogStorefrontConfig> => {
  const fromStore = extractCatalogStorefrontConfig(options.store);
  if (fromStore) {
    storefrontConfigCache.set(fromStore);
    return fromStore;
  }

  if (!options.forceRefresh) {
    const cached = storefrontConfigCache.get();
    if (cached) {
      return cached;
    }
  }

  let inFlight = storefrontConfigCache.getInFlight();
  if (!inFlight) {
    inFlight = StorefrontConfigRepository.fetch().then((config) => {
      storefrontConfigCache.set(config);
      return config;
    });
    storefrontConfigCache.setInFlight(inFlight);

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

