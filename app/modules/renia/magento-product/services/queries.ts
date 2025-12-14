// @env: mixed
import { QueryBuilder } from 'renia-graphql-client/builder';
import type { SelectionNode } from 'renia-graphql-client/types';

const PRODUCT_IN_LIST_SELECTION: SelectionNode[] = [
  { name: 'id' },
  { name: 'sku' },
  { name: 'name' },
  { name: 'url_key' },
  { name: 'url_path' },
  { name: '__typename'},
  {
    name: 'small_image',
    children: [
      { name: 'url' },
      { name: 'label' }
    ]
  },
  {
    name: 'price_range',
    children: [
      {
        name: 'minimum_price',
        children: [
          {
            name: 'regular_price',
            children: [
              { name: 'value' },
              { name: 'currency' }
            ]
          },
          {
            name: 'final_price',
            children: [
              { name: 'value' },
              { name: 'currency' }
            ]
          }
        ]
      }
    ]
  }
];

export const registerProductInListFragment = (builder: QueryBuilder) => {
  builder.addFragment('ProductInList', PRODUCT_IN_LIST_SELECTION, 'ProductInterface');
  return builder;
};

export const buildProductSearchQuery = (): QueryBuilder => {
  const builder = new QueryBuilder('query')
    .setName('ProductSearch')
    .setVariable('filter', 'ProductAttributeFilterInput')
    .setVariable('search', 'String')
    .setVariable('pageSize', 'Int')
    .setVariable('currentPage', 'Int')
    .setVariable('sort', 'ProductAttributeSortInput');

  registerProductInListFragment(builder);

  builder.addField([], 'products', {
    args: {
      filter: '$filter',
      search: '$search',
      pageSize: '$pageSize',
      currentPage: '$currentPage',
      sort: '$sort'
    }
  });

  builder.addField(['products'], 'items');
  builder.spreadFragment(['products', 'items'], 'ProductInList');

  builder.addField(['products'], 'total_count');

  builder.addField(['products'], 'page_info');
  builder.addField(['products', 'page_info'], 'current_page');
  builder.addField(['products', 'page_info'], 'page_size');

  builder.addField(['products'], 'sort_fields');
  builder.addField(['products', 'sort_fields'], 'default');
  builder.addField(['products', 'sort_fields'], 'options');
  builder.addField(['products', 'sort_fields', 'options'], 'value');
  builder.addField(['products', 'sort_fields', 'options'], 'label');

  return builder;
};

export const buildProductDetailQuery = (filters: string): QueryBuilder => {
  const builder = new QueryBuilder('query').setName('ProductDetail');
  registerProductInListFragment(builder);

  builder.addField([], 'products', {
    args: {
      filter: `{ ${filters} }`
    }
  });

  builder.addField(['products'], 'items');
  builder.spreadFragment(['products', 'items'], 'ProductInList');



  return builder;
};
