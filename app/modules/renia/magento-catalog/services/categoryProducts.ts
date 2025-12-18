// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import type { ProductInterface } from 'renia-magento-product/types';
import { mapProduct } from 'renia-magento-product/services/productMapper';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildCategoryProductsQuery } from './queries';

export type FetchCategoryProductsOptions = {
  categoryUid?: string;
  page?: number;
  pageSize?: number;
  sort?: Record<string, 'ASC' | 'DESC'>;
  filters?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeoutMs?: number;
};

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
): Promise<{ items: ProductInterface[]; total: number; page: number; pageSize: number }> => {
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;
  const filterString = buildFilter(opts);
  const sortString = opts.sort
    ? Object.entries(opts.sort)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
    : '';

  const payload = buildCategoryProductsQuery({
    filter: filterString,
    sort: sortString || undefined,
    pageSize,
    currentPage: page
  });

  const headers: Record<string, string> = { ...(opts.headers ?? {}) };

  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload,
    headers,
    timeoutMs: opts.timeoutMs,
    operationId: 'magentoCatalog.categoryProducts'
  });

  const res = await executeGraphQLRequest(request);
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
