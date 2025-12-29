// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import type { SearchCriteria } from '@renia/framework/api';
import { createProductSearchRequest } from './productSearchRequest.js';
import { mapProductSearchResponse } from './productSearchResponse.js';
import type { ProductSearchResults } from './productSearchResults.js';

const getList = async (criteria: SearchCriteria): Promise<ProductSearchResults> => {
  const req = createProductSearchRequest(criteria);
  const res = await executeGraphQLRequest(req);
  if (res.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }

  return mapProductSearchResponse(res.data, criteria);
};

export type ProductRepository = {
  getList: typeof getList;
};

export const productRepository: ProductRepository = {
  getList
};
