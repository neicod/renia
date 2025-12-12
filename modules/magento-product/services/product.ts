// @env: mixed
import { executeRequest } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import type { Product } from '../types';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildProductDetailQuery } from './queries';

type FetchProductOptions = {
  urlKey?: string;
  sku?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

const mapProduct = (item: any): Product => ({
  id: String(item?.id ?? item?.sku ?? Math.random()),
  sku: item?.sku ?? '',
  name: item?.name ?? '',
  urlKey: item?.url_key ?? undefined,
  urlPath: item?.url_path ?? undefined,
  thumbnail: item?.small_image?.url
    ? { url: item.small_image.url, label: item.small_image?.label }
    : undefined,
  price: item?.price_range?.minimum_price?.final_price
    ? {
        value: item.price_range.minimum_price.final_price.value,
        currency: item.price_range.minimum_price.final_price.currency
      }
    : undefined,
  priceOriginal: item?.price_range?.minimum_price?.regular_price
    ? {
        value: item.price_range.minimum_price.regular_price.value,
        currency: item.price_range.minimum_price.regular_price.currency
      }
    : undefined
});

export const fetchProduct = async (options: FetchProductOptions): Promise<Product | null> => {
  if (!options.urlKey && !options.sku) {
    throw new Error('fetchProduct: wymagany urlKey lub sku');
  }
  const factory = new MagentoGraphQLRequestFactory();

  const filters = options.urlKey
    ? `url_key: { eq: "${options.urlKey}" }`
    : `sku: { eq: "${options.sku}" }`;

  const query = new QueryBuilder(buildProductDetailQuery(filters)).toString();

  const headers: Record<string, string> = { ...(options.headers ?? {}) };

  const req = factory.create({
    method: 'POST',
    payload: query,
    headers,
    timeoutMs: options.timeoutMs
  });

  const res = await executeRequest(req);
  console.log(res);
  if (res.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }

  const items = (res.data as any)?.products?.items ?? [];
  if (!items.length) return null;
  return mapProduct(items[0]);
};

export default {
  fetchProduct
};
