// @env: mixed
import {registerGraphQLQueryAugmenter} from '@framework/api/graphqlClient';
import {QueryBuilder} from 'renia-graphql-client/builder';
import type {SelectionNode} from 'renia-graphql-client/types';

// Import product base selection to include in configurable product
import { PRODUCT_IN_LIST_SELECTION } from 'renia-magento-product/services/queries';

const CONFIGURABLE_PRODUCT_SELECTION: SelectionNode[] = [
    // First include all base product fields
    ...PRODUCT_IN_LIST_SELECTION,
    // Then add configurable-specific fields
    {
        name: 'configurable_options',
        children: [
            {name: 'attribute_id'},
            {name: 'attribute_code'},
            {name: 'label'},
            {name: 'position'},
            {
                name: 'values',
                children: [
                    {name: 'value_index'},
                    {name: 'label'},
                    {name: 'use_default_value'},
                    {
                        name: 'swatch_data',
                        children: [
                            {name: 'value'}
                        ]
                    }
                ]
            }
        ]
    },
    {
        name: 'variants',
        children: [
            {
                name: 'product',
                children: [
                    {name: 'id'},
                    {name: 'sku'},
                    {name: 'name'},
                    {
                        name: 'small_image',
                        children: [
                            {name: 'url'},
                            {name: 'label'}
                        ]
                    },
                    {
                        name: 'price_range',
                        children: [
                            {
                                name: 'minimum_price',
                                children: [
                                    {
                                        name: 'final_price',
                                        children: [
                                            {name: 'value'},
                                            {name: 'currency'}
                                        ]
                                    },
                                    {
                                        name: 'regular_price',
                                        children: [
                                            {name: 'value'},
                                            {name: 'currency'}
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {name: 'stock_status'}
                ]
            },
            {
                name: 'attributes',
                children: [
                    {name: 'code'},
                    {name: 'value_index'},
                    {name: 'label'}
                ]
            }
        ]
    }
];

registerGraphQLQueryAugmenter((payload, ctx) => {
    // Apply augmenter to product-related operations
    const operationId = ctx?.operationId;
    const isProductOperation =
        operationId?.startsWith('magentoProduct') ||  // Product search, detail
        operationId === 'magentoCatalog.categoryProducts';  // Category listing

    if (!isProductOperation) {
        return;
    }

    if (!(payload instanceof QueryBuilder)) {
        return;
    }

    // Add inline fragment for ConfigurableProduct type with all fields
    payload.inlineFragment(['products', 'items'], 'ConfigurableProduct', CONFIGURABLE_PRODUCT_SELECTION);
});
