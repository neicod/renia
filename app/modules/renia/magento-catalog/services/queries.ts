// @env: mixed
import { QueryBuilder } from 'renia-graphql-client/builder';
import { registerProductInListFragment } from 'renia-magento-product/services/queries';

export const buildCategoryUidQuery = (filter: string): QueryBuilder => {
  const builder = new QueryBuilder('query').setName('CategoryUid');
  builder.addField([], 'categoryList', {
    args: {
      filters: `{ ${filter} }`
    }
  });
  builder.addField(['categoryList'], 'uid');
  return builder;
};

export const buildCategoryProductsQuery = ({
  filter,
  sort,
  pageSize,
  currentPage
}: {
  filter: string;
  sort?: string;
  pageSize: number;
  currentPage: number;
}): QueryBuilder => {
  const builder = new QueryBuilder('query').setName('CategoryProducts');
  registerProductInListFragment(builder);

  const args: Record<string, string | number> = {
    pageSize,
    currentPage
  };

  if (filter) {
    args.filter = `{ ${filter} }`;
  }
  if (sort) {
    args.sort = `{ ${sort} }`;
  }

  builder.addField([], 'products', { args });
  builder.addField(['products'], 'items');
  builder.spreadFragment(['products', 'items'], 'ProductInList');

  builder.addField(['products'], 'total_count');

  builder.addField(['products'], 'page_info');
  builder.addField(['products', 'page_info'], 'current_page');
  builder.addField(['products', 'page_info'], 'page_size');

  return builder;
};
