// @env: mixed
import { executeRequest } from 'renia-graphql-client';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

export type StorefrontPageSizeConfig = {
  defaultGridPerPage?: number;
  gridPerPageValues: number[];
};

const STORE_CONFIG_QUERY = `
  query StorefrontPageSizeConfig {
    storeConfig {
      grid_per_page
      grid_per_page_values
    }
  }
`;

let configPromise: Promise<StorefrontPageSizeConfig> | null = null;

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
  const items: string[] = [];
  if (typeof value === 'string') {
    items.push(...value.split(','));
  } else if (Array.isArray(value)) {
    items.push(
      ...value.map((entry) => (typeof entry === 'string' ? entry : String(entry ?? '')))
    );
  }
  return items
    .map((entry) => parseNumber(entry))
    .filter((num): num is number => typeof num === 'number' && num > 0);
};

const normalizeValues = (values: number[], defaultValue?: number): number[] => {
  const uniq = new Set<number>();
  values.forEach((val) => {
    if (Number.isFinite(val) && val > 0) {
      uniq.add(val);
    }
  });
  if (typeof defaultValue === 'number' && defaultValue > 0) {
    uniq.add(defaultValue);
  }
  return Array.from(uniq).sort((a, b) => a - b);
};

export const fetchStorefrontPageSizeConfig = async (): Promise<StorefrontPageSizeConfig> => {
  if (!configPromise) {
    configPromise = (async () => {
      const request = MagentoGraphQLRequestFactory.create({
        method: 'POST',
        payload: STORE_CONFIG_QUERY,
      });

      const response = await executeRequest(request);
      if (response.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
      }

      const rawConfig = (response.data as any)?.storeConfig ?? {};

      const defaultGridPerPage = parseNumber(rawConfig?.grid_per_page);
      const parsedValues = parseValues(rawConfig?.grid_per_page_values);
      const gridPerPageValues = normalizeValues(parsedValues, defaultGridPerPage);

      return {
        defaultGridPerPage,
        gridPerPageValues,
      };
    })();
  }

  return configPromise;
};

export default {
  fetchStorefrontPageSizeConfig,
};
