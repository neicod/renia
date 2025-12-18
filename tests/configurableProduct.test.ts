// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { registerGraphQLQueryAugmenter, executeGraphQLRequest } from '@framework/api/graphqlClient';
import { registerProductMapper, mapProduct } from 'renia-magento-product/services/productMapper';

// Mock configurable product mapper
const configurableProductMapper = {
  map(item: any) {
    return {
      id: String(item?.id ?? item?.sku ?? Math.random()),
      sku: item?.sku ?? '',
      name: item?.name ?? '',
      urlKey: item?.url_key ?? undefined,
      thumbnail: item?.small_image?.url
        ? { url: item.small_image.url, label: item.small_image?.label }
        : undefined,
      price: item?.price_range?.minimum_price?.final_price
        ? {
            value: item.price_range.minimum_price.final_price.value,
            currency: item.price_range.minimum_price.final_price.currency
          }
        : undefined,
      priceOriginal: item?.price_range?.minimum_price?.regular_price
        ? {
            value: item.price_range.minimum_price.regular_price.value,
            currency: item.price_range.minimum_price.regular_price.currency
          }
        : undefined,
      __typename: 'ConfigurableProduct',
      configurableOptions: (item.configurable_options ?? []).map((opt: any) => ({
        attributeId: String(opt.attribute_id ?? ''),
        attributeCode: opt.attribute_code ?? '',
        label: opt.label ?? '',
        position: Number(opt.position ?? 0),
        values: (opt.values ?? []).map((val: any) => ({
          valueIndex: Number(val.value_index ?? 0),
          label: val.label ?? '',
          swatchData: val.swatch_data
            ? { type: val.swatch_data.type ?? 'TEXT', value: val.swatch_data.value ?? '' }
            : undefined
        }))
      })),
      variants: (item.variants ?? []).map((variant: any) => ({
        product: {
          id: String(variant.product?.id ?? ''),
          sku: variant.product?.sku ?? '',
          name: variant.product?.name ?? '',
          thumbnail: variant.product?.small_image?.url
            ? { url: variant.product.small_image.url, label: variant.product.small_image?.label }
            : undefined,
          price: variant.product?.price_range?.minimum_price?.final_price
            ? {
                value: variant.product.price_range.minimum_price.final_price.value,
                currency: variant.product.price_range.minimum_price.final_price.currency
              }
            : undefined,
          stockStatus: variant.product?.stock_status
        },
        attributes: (variant.attributes ?? []).map((attr: any) => ({
          code: attr.code ?? '',
          valueIndex: Number(attr.value_index ?? 0),
          label: attr.label ?? ''
        }))
      }))
    };
  }
};

// Register configurable product mapper
registerProductMapper('ConfigurableProduct', configurableProductMapper);

// Import and register the augmenter
import '../app/modules/renia/magento-configurable-product/services/configurableQueryAugmenter';

const createMockResponse = (body: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init
  });
};

test('augmenter dodaje configurable_options do zapytań magentoProduct.search', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: any = null;

  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return createMockResponse({
      data: {
        products: {
          items: [
            {
              id: '1',
              sku: 'shirt-001',
              name: 'Koszulka niebieska',
              url_key: 'koszulka-niebieska',
              __typename: 'ConfigurableProduct',
              small_image: { url: '/image.jpg', label: 'Shirt' },
              price_range: {
                minimum_price: {
                  final_price: { value: 99.99, currency: 'PLN' },
                  regular_price: { value: 149.99, currency: 'PLN' }
                }
              },
              configurable_options: [
                {
                  attribute_id: '92',
                  attribute_code: 'color',
                  label: 'Kolor',
                  position: 0,
                  values: [
                    {
                      value_index: 1,
                      label: 'Niebieski',
                      swatch_data: { type: 'COLOR', value: '#0000FF' }
                    }
                  ]
                }
              ],
              variants: [
                {
                  product: {
                    id: '2',
                    sku: 'shirt-001-blue',
                    name: 'Koszulka niebieska',
                    small_image: { url: '/image-blue.jpg', label: 'Blue' },
                    price_range: {
                      minimum_price: {
                        final_price: { value: 99.99, currency: 'PLN' },
                        regular_price: { value: 149.99, currency: 'PLN' }
                      }
                    },
                    stock_status: 'IN_STOCK'
                  },
                  attributes: [{ code: 'color', value_index: 1, label: 'Niebieski' }]
                }
              ]
            }
          ]
        }
      }
    });
  }) as typeof fetch;

  const builder = new QueryBuilder('query').setName('ProductSearch');
  builder.addField(['products', 'items'], 'id');
  builder.addField(['products', 'items'], 'sku');
  builder.addField(['products', 'items'], 'name');

  const response = await executeGraphQLRequest({
    endpoint: 'https://example.magento/graphql',
    method: 'POST',
    payload: builder,
    operationId: 'magentoProduct.search'
  });

  // Verify augmenter added configurable fields to query
  assert.ok(capturedBody?.query.includes('configurable_options'));
  assert.ok(capturedBody?.query.includes('variants'));
  assert.ok(capturedBody?.query.includes('attribute_code'));

  globalThis.fetch = originalFetch;
});

test('augmenter dodaje configurable_options do zapytań magentoCatalog.categoryProducts', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: any = null;

  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return createMockResponse({
      data: {
        products: {
          items: [
            {
              id: '1',
              sku: 'product-001',
              name: 'Produkt konfigurowalny',
              __typename: 'ConfigurableProduct',
              configurable_options: [],
              variants: []
            }
          ]
        }
      }
    });
  }) as typeof fetch;

  const builder = new QueryBuilder('query').setName('CategoryProducts');
  builder.addField(['products', 'items'], 'id');

  const response = await executeGraphQLRequest({
    endpoint: 'https://example.magento/graphql',
    method: 'POST',
    payload: builder,
    operationId: 'magentoCatalog.categoryProducts'
  });

  // Verify augmenter was applied to category products query
  assert.ok(capturedBody?.query.includes('configurable_options'));
  assert.ok(capturedBody?.query.includes('variants'));

  globalThis.fetch = originalFetch;
});

test('mapProduct zwraca ConfigurableProduct z pełnymi danymi konfiguracyjnymi', () => {
  const graphqlItem = {
    id: '1',
    sku: 'shirt-001',
    name: 'Koszulka',
    __typename: 'ConfigurableProduct',
    small_image: { url: '/img.jpg', label: 'Shirt' },
    price_range: {
      minimum_price: {
        final_price: { value: 99.99, currency: 'PLN' },
        regular_price: { value: 149.99, currency: 'PLN' }
      }
    },
    configurable_options: [
      {
        attribute_id: '92',
        attribute_code: 'color',
        label: 'Kolor',
        position: 0,
        values: [
          {
            value_index: 1,
            label: 'Niebieski',
            swatch_data: { type: 'COLOR', value: '#0000FF' }
          }
        ]
      }
    ],
    variants: [
      {
        product: {
          id: '2',
          sku: 'shirt-001-blue',
          name: 'Koszulka niebieska',
          stock_status: 'IN_STOCK'
        },
        attributes: [{ code: 'color', value_index: 1, label: 'Niebieski' }]
      }
    ]
  };

  const mapped = mapProduct(graphqlItem);

  assert.equal(mapped.__typename, 'ConfigurableProduct');
  assert.equal(mapped.sku, 'shirt-001');
  assert.equal(mapped.name, 'Koszulka');
  assert.equal((mapped as any).configurableOptions?.length, 1);
  assert.equal((mapped as any).configurableOptions?.[0]?.attributeCode, 'color');
  assert.equal((mapped as any).variants?.length, 1);
  assert.equal((mapped as any).variants?.[0]?.product?.sku, 'shirt-001-blue');
});

test('mapProduct fallback zwraca SimpleProduct dla produktu bez __typename', () => {
  const graphqlItem = {
    id: '1',
    sku: 'simple-001',
    name: 'Prosty produkt',
    small_image: { url: '/img.jpg', label: 'Product' },
    price_range: {
      minimum_price: {
        final_price: { value: 49.99, currency: 'PLN' }
      }
    }
  };

  const mapped = mapProduct(graphqlItem);

  assert.equal(mapped.__typename, 'SimpleProduct');
  assert.equal(mapped.sku, 'simple-001');
  assert.equal(mapped.name, 'Prosty produkt');
  // Configurable fields should not exist on simple products
  assert.equal((mapped as any).configurableOptions, undefined);
});
