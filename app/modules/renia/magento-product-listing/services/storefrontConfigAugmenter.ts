// @env: mixed
import { registerGraphQLQueryAugmenter } from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';

registerGraphQLQueryAugmenter((payload, ctx) => {
  if (ctx.operationId !== 'magentoStore.storeConfig') return;
  if (!(payload instanceof QueryBuilder)) return;
  payload.addField(['storeConfig'], 'grid_per_page');
  payload.addField(['storeConfig'], 'grid_per_page_values');
});

