// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeRoute } from '@renia/framework/router/normalize';

test('normalizeRoute: zachowuje contexts z routes.ts', () => {
  const route = normalizeRoute({
    path: '/product/:urlKey',
    componentPath: 'renia-magento-product/pages/ProductPage',
    contexts: ['product', 'default'],
    priority: 40
  });

  assert.ok(route);
  assert.deepEqual(route.contexts, ['product', 'default']);
});
