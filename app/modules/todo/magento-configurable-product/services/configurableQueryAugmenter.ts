// @env: mixed
import { registerGraphQLQueryAugmenter } from '@renia/framework/api/graphqlClient';
import { gql } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { PRODUCT_IN_LIST_SELECTION } from 'renia-magento-product/services/queries';

const CONFIGURABLE_PRODUCT_SELECTION = gql`
  ${PRODUCT_IN_LIST_SELECTION}
  configurable_options {
    attribute_id
    attribute_code
    label
    position
    values {
      value_index
      label
      use_default_value
      swatch_data { value }
    }
  }
  variants {
    product {
      id
      sku
      name
      small_image { url label }
      price_range {
        minimum_price {
          final_price { value currency }
          regular_price { value currency }
        }
      }
      stock_status
    }
    attributes { code value_index label }
  }
`;

registerGraphQLQueryAugmenter((payload, ctx) => {
  const operationId = ctx?.operationId;
  const isProductOperation =
    operationId?.startsWith('magentoProduct') ||
    operationId === 'magentoCatalog.categoryProducts';

  if (!isProductOperation) return;
  if (!(payload instanceof QueryBuilder)) return;

  payload.add(gql`
    products {
      items {
        ... on ConfigurableProduct {
          ${CONFIGURABLE_PRODUCT_SELECTION}
        }
      }
    }
  `);
});
