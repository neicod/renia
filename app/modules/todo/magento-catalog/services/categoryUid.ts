// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { buildCategoryUidQuery } from './queries';

const runQuery = async ({
  filter,
  headers
}: {
  filter: string;
  headers?: Record<string, string>;
}) => {
  const req = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildCategoryUidQuery(filter),
    headers: {
      ...(headers ?? {})
    },
    operationId: 'magentoCatalog.categoryUid'
  });

  const res = await executeGraphQLRequest(req);
  if (res.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }
  const list = (res.data as any)?.categoryList;
  if (Array.isArray(list) && list.length && list[0]?.uid) {
    return String(list[0].uid);
  }
  return undefined;
};

export const fetchCategoryUid = async ({
  urlPath,
  headers
}: {
  urlPath: string;
  headers?: Record<string, string>;
}): Promise<string | undefined> => {
  const path = urlPath.replace(/^\/+|\/+$/g, '');
  const lastSegment = path.split('/').pop() ?? path;
  const candidates = [
    `url_path: { eq: "${path}" }`,
    `url_path: { eq: "${path}.html" }`,
    `url_key: { eq: "${lastSegment}" }`,
    `url_key: { eq: "${lastSegment}.html" }`
  ];

  for (const filter of candidates) {
    const uid = await runQuery({ filter, headers });
    if (uid) return uid;
  }
  return undefined;
};

export default {
  fetchCategoryUid
};
