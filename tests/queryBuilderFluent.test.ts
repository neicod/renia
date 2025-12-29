// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { QueryBuilder } from 'renia-graphql-client/builder';

test('fluent API: add() scala snippet bez duplikatów', () => {
  const qb = new QueryBuilder('mutation').setName('RemoveItemFromCart');
  qb.add('removeItemFromCart');

  qb.at('removeItemFromCart').add('user_errors { code message }');
  qb.at('removeItemFromCart').add('user_errors { code message }');

  const q = qb.toString();
  assert.match(q, /removeItemFromCart/);
  assert.match(q, /user_errors/);
  assert.match(q, /code/);
  assert.match(q, /message/);
  assert.equal((q.match(/user_errors/g) ?? []).length, 1);
});

test('fluent API: konflikty args nadpisują z console.warn', () => {
  const originalWarn = console.warn;
  const calls: Array<{ message: string; meta?: unknown }> = [];
  console.warn = ((message: string, meta?: unknown) => {
    calls.push({ message, meta });
  }) as typeof console.warn;

  try {
    const qb = new QueryBuilder('query').setName('Products');
    qb.add('products(pageSize: 10)');
    qb.at('').add('products(pageSize: 20) { total_count }');

    const q = qb.toString();
    assert.match(q, /products\(pageSize: 20\)/);
    assert.ok(calls.length >= 1);
    assert.ok(calls.some((c) => c.message.includes('overriding argument value')));
  } finally {
    console.warn = originalWarn;
  }
});

test('fluent API: at() rzuca wyjątek gdy ścieżka nie istnieje', () => {
  const qb = new QueryBuilder('query').setName('X');
  assert.throws(() => qb.at('missing.path'), /Path not found/);
});

test('fluent API: obsługuje inline fragmenty i directives', () => {
  const qb = new QueryBuilder('query').setName('Cart');
  qb.add('cart');

  qb.at('cart').add('items { ... on BundleProduct @skip(if: $cond) { sku } }');

  const q = qb.toString();
  assert.match(q, /\.\.\. on BundleProduct @skip\(if: \$cond\)/);
  assert.match(q, /sku/);
});

test('addFragment: obsługuje selekcję jako string', () => {
  const qb = new QueryBuilder('query').setName('Products');
  qb.addFragment('ProductBase', 'id sku name', 'ProductInterface');
  qb.add('products { items { ...ProductBase } }');

  const q = qb.toString();
  assert.match(q, /fragment ProductBase on ProductInterface/);
  assert.match(q, /id/);
  assert.match(q, /sku/);
  assert.match(q, /name/);
  assert.match(q, /\.\.\.ProductBase/);
});
