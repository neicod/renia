// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { createProductSearchRequest } from './productSearchRequest.js';
import { mapProductSearchResponse } from './productSearchResponse.js';
const getList = async (criteria) => {
    const req = createProductSearchRequest(criteria);
    const res = await executeGraphQLRequest(req);
    if (res.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
    }
    return mapProductSearchResponse(res.data, criteria);
};
export const productRepository = {
    getList
};
