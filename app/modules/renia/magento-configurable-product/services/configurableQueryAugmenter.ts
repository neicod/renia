// @env: mixed
import {registerGraphQLQueryAugmenter} from '@framework/api/graphqlClient';
import {QueryBuilder} from 'renia-graphql-client/builder';
import type {SelectionNode} from 'renia-graphql-client/types';

const CONFIGURABLE_PRODUCT_SELECTION: SelectionNode[] = [
    {name: '__typename'},
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

    if (!ctx.operationId.startsWith('magentoProduct')) {
        return;
    }

    if (!(payload instanceof QueryBuilder)) {
        return;
    }

    payload.inlineFragment(['products', 'items'], 'ConfigurableProduct', CONFIGURABLE_PRODUCT_SELECTION);
});

export const registerConfigurableAugmenter = () => {
    // Augmenter is already registered at module load time
};

export default {registerConfigurableAugmenter};
