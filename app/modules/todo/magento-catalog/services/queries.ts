// @env: mixed
import { gql } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { registerProductInListFragment } from 'renia-magento-product/services/queries';

export const buildCategoryUidQuery = (filter: string): QueryBuilder => {
  const builder = new QueryBuilder('query').setName('CategoryUid');
  builder.add(gql`
    categoryList(filters: { ${filter} }) {
      uid
    }
  `);
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

  const args: string[] = [`pageSize: ${pageSize}`, `currentPage: ${currentPage}`];
  if (filter){
    args.push(`filter: { ${filter} }`);
  }
  if (sort){
    args.push(`sort: { ${sort} }`);
  }

  const builder = new QueryBuilder('query').setName('CategoryProducts');

  builder.add(gql`
    products(${args.join(' ')}) {
      items { ...ProductInList }
      total_count
      page_info { current_page page_size }
    }
  `);

  registerProductInListFragment(builder);

  return builder;
};
