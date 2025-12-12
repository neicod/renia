// @env: mixed
import { PRODUCT_IN_LIST_FRAGMENT } from 'magento-product/services/queries';

export const buildCategoryUidQuery = (filter: string): string => `
  query CategoryUid {
    categoryList(filters: { ${filter} }) {
      uid
    }
  }
`;

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
}): string => {
  const sortString = sort ? `, sort: { ${sort} }` : '';

  return `
    query CategoryProducts {
      products(
        filter: { ${filter} }
        pageSize: ${pageSize}
        currentPage: ${currentPage}
        ${sortString}
      ) {
        items { ...ProductInList }
        total_count
        page_info { current_page page_size }
      }
    }

    ${PRODUCT_IN_LIST_FRAGMENT}
  `;
};
