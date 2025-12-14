// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import type { ProductInterface } from '../types';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildProductDetailQuery } from './queries';
import { mapProduct } from './productMapper';
import { getLogger } from 'renia-logger';

const logger = getLogger();

type FetchProductOptions = {
  urlKey?: string;
  sku?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export const fetchProduct = async (options: FetchProductOptions): Promise<ProductInterface | null> => {
  logger.info('fetchProduct', 'Starting with options', options);

  if (!options.urlKey && !options.sku) {
    throw new Error('fetchProduct: wymagany urlKey lub sku');
  }

  const filters = options.urlKey
    ? `url_key: { eq: "${options.urlKey}" }`
    : `sku: { eq: "${options.sku}" }`;

  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  const req = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildProductDetailQuery(filters),
    headers,
    timeoutMs: options.timeoutMs,
    operationId: 'magentoProduct.detail'
  });

  logger.info('fetchProduct', 'Executing GraphQL request');
  const res = await executeGraphQLRequest(req);
  logger.info('fetchProduct', 'GraphQL response', { status: res.errors ? 'error' : 'success', errorCount: res.errors?.length ?? 0 });

  if (res.errors) {
    logger.error('fetchProduct', 'GraphQL errors', { errors: res.errors });
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }

  const items = (res.data as any)?.products?.items ?? [];
  logger.info('fetchProduct', 'Items count', { count: items.length });

  if (!items.length) {
    logger.warn('fetchProduct', 'No items returned');
    return null;
  }

  logger.debug('fetchProduct', 'Mapping product', { __typename: items[0]?.__typename, sku: items[0]?.sku });
  try {
    const mapped = mapProduct(items[0]);
    logger.debug('fetchProduct', 'Mapped product successfully');
    return mapped;
  } catch (err) {
    logger.error('fetchProduct', 'Error mapping product', { error: err instanceof Error ? err.message : String(err) });
    throw err;
  }
};

export default {
  fetchProduct
};
