// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { CMS_PAGE_BY_IDENTIFIER } from './cmsQueries';

export type CmsPage = {
  identifier: string;
  title?: string | null;
  content?: string | null;
};

export const fetchCmsPage = async ({
  identifier,
  headers
}: {
  identifier: string;
  headers?: Record<string, string>;
}): Promise<CmsPage | null> => {
  const id = (identifier ?? '').trim();
  if (!id) return null;

  const query = new QueryBuilder(CMS_PAGE_BY_IDENTIFIER).toString();
  const req = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: query,
    variables: { identifier: id },
    headers,
    operationId: 'magentoCms.page'
  });

  const res = await executeGraphQLRequest(req);
  if (res.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(res.errors)}`);
  }

  const page = (res.data as any)?.cmsPage;
  if (!page) return null;

  return {
    identifier: String(page.identifier ?? id),
    title: typeof page.title === 'string' ? page.title : null,
    content: typeof page.content === 'string' ? page.content : null
  };
};

export default {
  fetchCmsPage
};

