// @env: mixed
import { registerGraphQLHeaderAugmenter } from '@framework/api/graphqlClient';
import { getStoredCustomerToken } from './authStorage';

const headerAugmenter = (headers: Record<string, string>) => {
  const token = getStoredCustomerToken();
  if (token) {
    headers.authorization = `Bearer ${token}`;
  } else {
    if (headers.authorization) {
      delete headers.authorization;
    }
  }
};

registerGraphQLHeaderAugmenter(headerAugmenter);
