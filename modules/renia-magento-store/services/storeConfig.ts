// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

export type StoreConfig = {
  code?: string;
  locale?: string;
  currency?: string;
  raw?: Record<string, unknown>;
};

const buildStoreConfigQuery = () => {
  const builder = new QueryBuilder('query').setName('StoreConfig');
  builder.addField([], 'storeConfig');
  builder.addField(['storeConfig'], 'id');
  builder.addField(['storeConfig'], 'code');
  builder.addField(['storeConfig'], 'locale');
  builder.addField(['storeConfig'], 'base_currency_code');
  builder.addField(['storeConfig'], 'default_display_currency_code');
  return builder;
};

let cache: StoreConfig | null = null;
let inFlight: Promise<StoreConfig> | null = null;

const mapStoreConfig = (raw: Record<string, unknown>): StoreConfig => {
  return {
    code: typeof raw?.code === 'string' ? raw.code : undefined,
    locale: typeof raw?.locale === 'string' ? raw.locale : undefined,
    currency:
      typeof raw?.default_display_currency_code === 'string'
        ? (raw.default_display_currency_code as string)
        : typeof raw?.base_currency_code === 'string'
          ? (raw.base_currency_code as string)
          : undefined,
    raw
  };
};

export const getStoreConfig = async (
  options: { forceRefresh?: boolean } = {}
): Promise<StoreConfig> => {
  if (cache && !options.forceRefresh) {
    return cache;
  }

  if (!inFlight) {
    inFlight = (async () => {
      const request = MagentoGraphQLRequestFactory.create({
        method: 'POST',
        payload: buildStoreConfigQuery(),
        operationId: 'magentoStore.storeConfig'
      });
      const response = await executeGraphQLRequest(request);
      if (response.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
      }
      const rawConfig = ((response.data as any)?.storeConfig ?? {}) as Record<string, unknown>;
      const mapped = mapStoreConfig(rawConfig);
      cache = mapped;
      return mapped;
    })().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
};

export default {
  getStoreConfig
};
