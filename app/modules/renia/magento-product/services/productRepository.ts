// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import type { SearchCriteria } from '@framework/api';
import type { Product } from '../types';
import { fetchProduct } from './product';
import { createProductSearchRequest } from './productSearchRequest';
import { mapProductSearchResponse } from './productSearchResponse';
import type { ProductSearchResults } from './productSearchResults';
import { getLogger } from 'renia-logger';

const logger = getLogger();

const getByUrlKey = async (urlKey: string): Promise<Product | null> => {
  try {
    return await fetchProduct({ urlKey });
  } catch (error) {
    logger.error('productRepository.getByUrlKey', 'Error fetching product', { urlKey, error: error instanceof Error ? error.message : String(error) });
    return null;
  }
};

const getList = async (criteria: SearchCriteria): Promise<ProductSearchResults> => {
  const req = createProductSearchRequest(criteria);
  const res = await executeGraphQLRequest(req);
  if (res.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }

  return mapProductSearchResponse(res.data, criteria);
};

export type ProductRepository = {
  getByUrlKey: typeof getByUrlKey;
  getList: typeof getList;
};

export const productRepository: ProductRepository = {
  getByUrlKey,
  getList
};
