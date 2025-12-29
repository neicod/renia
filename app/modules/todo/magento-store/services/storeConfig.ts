// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { gql } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

export type StoreConfig = {
  id?: string;
  code?: string;
  locale?: string;
  currency?: string;
  passwordPolicy?: {
    minLength?: number;
    requiredCharacterClasses?: number;
  };
  raw?: Record<string, unknown>;
};

const buildStoreConfigQuery = () => {
  const builder = new QueryBuilder('query').setName('StoreConfig');
  builder.add(gql`
    storeConfig {
      id
      code
      locale
      base_currency_code
      default_display_currency_code
      minimum_password_length
      required_character_classes_number
    }
  `);
  return builder;
};

let cache: StoreConfig | null = null;
let inFlight: Promise<StoreConfig> | null = null;

const mapStoreConfig = (raw: Record<string, unknown>): StoreConfig => {
  const minPasswordLength =
    typeof raw?.minimum_password_length === 'number'
      ? raw.minimum_password_length
      : typeof raw?.minimum_password_length === 'string'
        ? Number(raw.minimum_password_length)
        : undefined;
  const requiredClasses =
    typeof raw?.required_character_classes_number === 'number'
      ? raw.required_character_classes_number
      : typeof raw?.required_character_classes_number === 'string'
        ? Number(raw.required_character_classes_number)
        : undefined;

  return {
    id: typeof raw?.id === 'string' ? raw.id : undefined,
    code: typeof raw?.code === 'string' ? raw.code : undefined,
    locale: typeof raw?.locale === 'string' ? raw.locale : undefined,
    currency:
      typeof raw?.default_display_currency_code === 'string'
        ? (raw.default_display_currency_code as string)
        : typeof raw?.base_currency_code === 'string'
          ? (raw.base_currency_code as string)
          : undefined,
    passwordPolicy:
      minPasswordLength || requiredClasses
        ? {
            minLength: Number.isFinite(minPasswordLength) ? Number(minPasswordLength) : undefined,
            requiredCharacterClasses: Number.isFinite(requiredClasses)
              ? Number(requiredClasses)
              : undefined
          }
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
