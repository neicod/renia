// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('SSR invariant: default interceptors must run before route handlers (configurable PDP)', () => {
  const code = `
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import { loadInterceptors } from '@renia/framework/interceptors/loadInterceptors';
import { LayoutTreeBuilder, ExtensionsRegistry } from '@renia/framework/layout';
import { registerComponents } from '@renia/framework/registry/componentRegistry';
import { registerProductTypeComponentStrategy } from 'renia-magento-product/services/productStrategies';
import handleMagentoRoute from 'renia-magento-routing/routeHandler';
import { isConfigurableProduct } from 'renia-magento-configurable-product/types';

const configPath = path.resolve(process.cwd(), 'app/etc/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const enabledModules = Object.entries(config.modules ?? {}).filter(([, v]) => v).map(([name]) => name);
const statusMap = Object.fromEntries(enabledModules.map((name) => [name, true]));

const createMockResponse = (body, init) => new Response(JSON.stringify(body), {
  status: 200,
  headers: { 'content-type': 'application/json' },
  ...(init ?? {})
});

let lastProductDetailQuery = null;
globalThis.fetch = async (_url, init) => {
  const body = init?.body ? JSON.parse(String(init.body)) : null;
  const query = body?.query ?? '';

  if (query.includes('urlResolver')) {
    return createMockResponse({
      data: { urlResolver: { type: 'PRODUCT', relative_url: 'test-product.html' } }
    });
  }

  if (query.includes('ProductDetail') || query.includes('products')) {
    lastProductDetailQuery = String(query);
    return createMockResponse({
      data: {
        products: {
          items: [
            {
              id: '1',
              sku: 'test-product',
              name: 'Test Product',
              url_key: 'test-product',
              url_path: 'test-product.html',
              __typename: 'ConfigurableProduct',
              small_image: { url: '/image.jpg', label: 'Test' },
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
                  values: [{ value_index: 1, label: 'Niebieski' }]
                }
              ],
              variants: [
                {
                  product: {
                    id: '2',
                    sku: 'test-product-blue',
                    name: 'Test Product Blue',
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
  }

  return createMockResponse({ data: {} });
};

const runHandler = async () => {
  lastProductDetailQuery = null;
  const result = await handleMagentoRoute({ req: { path: '/test-product.html' }, store: null });
  const product = result?.meta?.product ?? null;
  return {
    productQuery: lastProductDetailQuery,
    isConfigurable: product ? isConfigurableProduct(product) : false,
    hasConfigurableOptions: Array.isArray(product?.configurableOptions)
  };
};

// 1) Without default interceptors: no query augmentation + mapper isn't registered → product isn't a real ConfigurableProduct.
const before = await runHandler();
assert.ok(before.productQuery, 'Expected product query to be captured');
assert.ok(!before.productQuery.includes('configurable_options'), 'Expected query NOT to include configurable_options before default interceptors');
assert.ok(!before.productQuery.includes('variants'), 'Expected query NOT to include variants before default interceptors');
assert.equal(before.isConfigurable, false, 'Expected product to NOT be treated as ConfigurableProduct before default interceptors');
assert.equal(before.hasConfigurableOptions, false, 'Expected mapped product to NOT expose configurableOptions before default interceptors');

// 2) After default interceptors: augmenter + mapper registered → query contains fields and product is typed properly.
{
  const layoutTree = new LayoutTreeBuilder();
  const extensions = new ExtensionsRegistry();
  const api = {
    registerComponents,
    registerProductTypeComponentStrategy,
    layout: layoutTree.at('page'),
    extend: extensions
  };
  await loadInterceptors('default', { configPath, statusMap, includeDefault: true }, api);
}

const after = await runHandler();
assert.ok(after.productQuery, 'Expected product query to be captured after default interceptors');
assert.ok(after.productQuery.includes('configurable_options'), 'Expected query to include configurable_options after default interceptors');
assert.ok(after.productQuery.includes('variants'), 'Expected query to include variants after default interceptors');
assert.equal(after.isConfigurable, true, 'Expected product to be treated as ConfigurableProduct after default interceptors');
assert.equal(after.hasConfigurableOptions, true, 'Expected mapped product to expose configurableOptions after default interceptors');

console.log('ok');
`;

  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', '--input-type=module', '-e', code],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'test',
        // Ensure the routing handler doesn't serve stale cached products between the two runs.
        RENIA_MAGENTO_ROUTING_CACHE_TTL_MS: '0'
      },
      encoding: 'utf8'
    }
  );

  if (result.status !== 0) {
    // Help debugging in CI/dev logs.
    // eslint-disable-next-line no-console
    console.error('[child stdout]', result.stdout);
    // eslint-disable-next-line no-console
    console.error('[child stderr]', result.stderr);
  }

  assert.equal(result.status, 0, 'Expected child process to succeed');
  assert.match(result.stdout ?? '', /ok/);
});
