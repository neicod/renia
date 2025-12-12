// @env: mixed
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import type { SearchCriteria } from '@framework/api';
import type { Product } from '../types';
import { fetchProduct } from './product';
import { createProductSearchRequest } from './productSearchRequest';
import { mapProductSearchResponse } from './productSearchResponse';
import type { ProductSearchResults } from './productSearchResults';

const getByUrlKey = async (urlKey: string): Promise<Product | null> => {
  try {
    return await fetchProduct({ urlKey });
  } catch (error) {
    console.error('Error fetching product by urlKey', error);
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
