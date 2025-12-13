// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import type { StoreConfig } from 'renia-magento-store';

export const DEFAULT_PAGE_SIZE = 12;

export type CatalogStorefrontConfig = {
  gridPerPage?: number;
  gridPerPageValues: number[];
};

let cache: CatalogStorefrontConfig | null = null;
let inFlight: Promise<CatalogStorefrontConfig> | null = null;

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseValues = (value: unknown): number[] => {
  const entries: string[] = [];
  if (typeof value === 'string') {
    entries.push(...value.split(','));
  } else if (Array.isArray(value)) {
    entries.push(...value.map((entry) => (typeof entry === 'string' ? entry : String(entry ?? ''))));
  }
  return entries
    .map((entry) => parseNumber(entry))
    .filter((val): val is number => typeof val === 'number' && val > 0);
};

const normalizeValues = (values: number[], fallback?: number): number[] => {
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
};

export const extractCatalogStorefrontConfig = (
  store?: StoreConfig | null
): CatalogStorefrontConfig | null => {
  if (!store?.raw) return null;
  const raw = store.raw as Record<string, unknown>;
  const gridPerPage = parseNumber((raw as any)?.grid_per_page);
  const options = normalizeValues(parseValues((raw as any)?.grid_per_page_values), gridPerPage);
  return {
    gridPerPage,
    gridPerPageValues: options
  };
};

const buildStorefrontPageSizeQuery = () => {
  const builder = new QueryBuilder('query').setName('StorefrontPageSizeConfig');
  builder.addField([], 'storeConfig');
  builder.addField(['storeConfig'], 'grid_per_page');
  builder.addField(['storeConfig'], 'grid_per_page_values');
  return builder;
};

const fetchCatalogStorefrontConfig = async (): Promise<CatalogStorefrontConfig> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildStorefrontPageSizeQuery(),
    operationId: 'magentoCatalog.storefrontConfig'
  });
  const response = await executeGraphQLRequest(request);
  if (response.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
  }
  const raw = ((response.data as any)?.storeConfig ?? {}) as Record<string, unknown>;
  const config = extractCatalogStorefrontConfig({ raw } as StoreConfig);
  return (
    config ?? {
      gridPerPage: DEFAULT_PAGE_SIZE,
      gridPerPageValues: [DEFAULT_PAGE_SIZE]
    }
  );
};

export const getCatalogStorefrontConfig = async (
  options: { forceRefresh?: boolean; store?: StoreConfig | null } = {}
): Promise<CatalogStorefrontConfig> => {
  const fromStore = extractCatalogStorefrontConfig(options.store);
  if (fromStore) {
    cache = fromStore;
    return fromStore;
  }

  if (cache && !options.forceRefresh) {
    return cache;
  }

  if (!inFlight) {
    inFlight = fetchCatalogStorefrontConfig().finally(() => {
      inFlight = null;
    });
  }

  cache = await inFlight;
  return cache;
};

export default {
  getCatalogStorefrontConfig,
  extractCatalogStorefrontConfig
};
