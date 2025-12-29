// @env: mixed
import { registerGraphQLQueryAugmenter } from '@renia/framework/api/graphqlClient';
import { gql } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';

registerGraphQLQueryAugmenter((payload, ctx) => {
  if (ctx.operationId !== 'magentoStore.storeConfig') return;
  if (!(payload instanceof QueryBuilder)) return;
  payload.add(gql`
    storeConfig {
      grid_per_page
      grid_per_page_values
    }
  `);
});
