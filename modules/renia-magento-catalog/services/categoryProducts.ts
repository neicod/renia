// @env: mixed
import { executeRequest } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import type { Product } from 'magento-product/types';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildCategoryProductsQuery } from './queries';

export type FetchCategoryProductsOptions = {
  categoryUrlPath?: string;
  categoryUid?: string;
  page?: number;
  pageSize?: number;
  sort?: Record<string, 'ASC' | 'DESC'>;
  filters?: Record<string, unknown>;
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

const buildFilter = (opts: FetchCategoryProductsOptions) => {
  const filters: string[] = [];
  if (opts.categoryUid) {
    filters.push(`category_uid: { eq: "${opts.categoryUid}" }`);
  }
  if (opts.filters) {
    for (const [key, value] of Object.entries(opts.filters)) {
      if (value === undefined || value === null) continue;
      filters.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  return filters.length ? filters.join(', ') : '';
};

export const fetchCategoryProducts = async (
  opts: FetchCategoryProductsOptions
): Promise<{ items: Product[]; total: number; page: number; pageSize: number }> => {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;
  const filterString = buildFilter(opts);
  const sortString = opts.sort
    ? Object.entries(opts.sort)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';

  const query = buildCategoryProductsQuery({
    filter: filterString,
    sort: sortString || undefined,
    pageSize,
    currentPage: page
  });
  const payload = new QueryBuilder(query).toString();

  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  const factory = new MagentoGraphQLRequestFactory();

  const request = factory.create({
    method: 'POST',
    payload,
    headers,
    timeoutMs: opts.timeoutMs
  });

  const res = await executeRequest(request);
  if (res.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }

  const data = (res.data as any)?.products;
  const items = Array.isArray(data?.items) ? data.items.map(mapProduct) : [];
  const total = typeof data?.total_count === 'number' ? data.total_count : items.length;
  const pageInfo = data?.page_info ?? {};

  return {
    items,
    total,
    page: pageInfo.current_page ?? page,
    pageSize: pageInfo.page_size ?? pageSize
  };
};

export default {
  fetchCategoryProducts
};
