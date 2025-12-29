// @env: mixed
import { gql, QueryBuilder } from 'renia-graphql-client';

type VariableDef = { name: string; type: string };

const applyVariables = (builder: QueryBuilder, vars: VariableDef[]) => {
  vars.forEach(({ name, type }) => builder.setVariable(name, type));
  return builder;
};

const PRODUCT_SEARCH_VARIABLES: VariableDef[] = [
  { name: 'filter', type: 'ProductAttributeFilterInput' },
  { name: 'search', type: 'String' },
  { name: 'pageSize', type: 'Int' },
  { name: 'currentPage', type: 'Int' },
  { name: 'sort', type: 'ProductAttributeSortInput' }
];

export const PRODUCT_IN_LIST_SELECTION = gql`
  id
  sku
  name
  url_key
  url_path
  __typename
  small_image { url label }
  price_range {
    minimum_price {
      regular_price { value currency }
      final_price { value currency }
    }
  }
`;

const PRODUCT_SEARCH_SELECTION = gql`
  products(
    filter: $filter
    search: $search
    pageSize: $pageSize
    currentPage: $currentPage
    sort: $sort
  ) {
    items { ...ProductInList }
    total_count
    page_info { current_page page_size }
    sort_fields { default options { value label } }
  }
`;

const buildProductDetailSelection = (filters: string) => gql`
  products(filter: { ${filters} }) {
    items { ...ProductInList }
  }
`;

export const registerProductInListFragment = (builder: QueryBuilder) => {
  builder.addFragment('ProductInList', PRODUCT_IN_LIST_SELECTION, 'ProductInterface');
  return builder;
};

const addProductSearchFields = (builder: QueryBuilder) => {
  builder.add(PRODUCT_SEARCH_SELECTION);
};

export const buildProductSearchQuery = (): QueryBuilder => {
  const builder = new QueryBuilder('query').setName('ProductSearch');
  applyVariables(builder, PRODUCT_SEARCH_VARIABLES);

  registerProductInListFragment(builder);
  addProductSearchFields(builder);

  return builder;
};

export const buildProductDetailQuery = (filters: string): QueryBuilder => {
  const builder = new QueryBuilder('query').setName('ProductDetail');
  registerProductInListFragment(builder);

  builder.add(buildProductDetailSelection(filters));

  return builder;
};
