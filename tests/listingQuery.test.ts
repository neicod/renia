// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyListingQuery,
  normalizeListingQuery,
  normalizeSearchTermKey,
  readListingQueryState
} from '@renia/framework/router/listingQuery';

test('readListingQueryState: reads canonical and alias keys', () => {
  const stateA = readListingQueryState('?page=2&pageSize=24&sort=price:DESC');
  assert.deepEqual(stateA, { page: 2, pageSize: 24, sort: 'price:DESC' });

  const stateB = readListingQueryState('?p=3&ps=48&s=name:ASC');
  assert.deepEqual(stateB, { page: 3, pageSize: 48, sort: 'name:ASC' });
});

test('applyListingQuery: removes aliases and de-duplicates keys', () => {
  const out = applyListingQuery('?page=1&page=2&p=3', { page: 3 }, { page: 1 });
  assert.equal(out, '?page=3');
});

test('applyListingQuery: omits defaults', () => {
  const outA = applyListingQuery('?page=2', { page: 1 }, { page: 1 });
  assert.equal(outA, '');

  const outB = applyListingQuery('?sort=price:ASC', { sort: 'relevance' }, { sort: 'relevance' });
  assert.equal(outB, '');
});

test('applyListingQuery: preserves unrelated params', () => {
  const out = applyListingQuery('?q=shoe&page=2', { sort: 'price:ASC' }, { page: 1, sort: 'relevance' });
  const params = new URLSearchParams(out.startsWith('?') ? out.slice(1) : out);
  assert.equal(params.get('q'), 'shoe');
  assert.equal(params.get('page'), '2');
  assert.equal(params.get('sort'), 'price:ASC');
  assert.deepEqual(Array.from(params.keys()).sort(), ['page', 'q', 'sort']);
});

test('normalizeSearchTermKey: converts query->q', () => {
  assert.equal(normalizeSearchTermKey('?query=abc'), '?q=abc');
  assert.equal(normalizeSearchTermKey('?q=ok&query=legacy'), '?q=ok');
});

test('normalizeListingQuery: canonicalizes aliases, duplicates, and defaults', () => {
  const outA = normalizeListingQuery('?p=2&page=3&ps=48&limit=24&s=price:ASC&sort=relevance', {
    page: 1,
    sort: 'relevance',
    pageSize: 24
  });
  // last wins: page=3, pageSize=24; sort is default so omitted
  const paramsA = new URLSearchParams(outA.startsWith('?') ? outA.slice(1) : outA);
  assert.equal(paramsA.get('page'), '3');
  assert.equal(paramsA.get('pageSize'), null); // default omitted
  assert.equal(paramsA.get('sort'), null); // default omitted
});

test('normalizeListingQuery: preserves unrelated params', () => {
  const out = normalizeListingQuery('?q=shoe&page=2&page=2&foo=bar&ps=12', { page: 1, pageSize: 24 });
  const params = new URLSearchParams(out.startsWith('?') ? out.slice(1) : out);
  assert.equal(params.get('q'), 'shoe');
  assert.equal(params.get('foo'), 'bar');
  assert.equal(params.get('page'), '2');
  assert.equal(params.get('pageSize'), '12');
});
