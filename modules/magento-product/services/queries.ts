// @env: mixed

export const PRODUCT_IN_LIST_FRAGMENT = `
  fragment ProductInList on ProductInterface {
    id
    sku
    name
    url_key
    url_path
    small_image { url label }
    price_range {
      minimum_price {
        regular_price { value currency }
        final_price { value currency }
      }
    }
  }
`;

export const PRODUCT_SEARCH_QUERY = `
  query ProductSearch(
    $filter: ProductAttributeFilterInput,
    $pageSize: Int,
    $currentPage: Int,
    $sort: ProductAttributeSortInput
  ) {
    products(
      filter: $filter,
      pageSize: $pageSize,
      currentPage: $currentPage,
      sort: $sort
    ) {
      items { ...ProductInList }
      total_count
      page_info { current_page page_size }
      sort_fields {
        default
        options { value label }
      }
    }
  }

  ${PRODUCT_IN_LIST_FRAGMENT}
`;

export const buildProductDetailQuery = (filters: string): string => `
  query ProductDetail {
    products(filter: { ${filters} }) {
      items { ...ProductInList }
    }
  }

  ${PRODUCT_IN_LIST_FRAGMENT}
`;
