// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerGraphQLHeaderAugmenter,
  registerGraphQLQueryAugmenter,
  executeGraphQLRequest
} from '@framework/api/graphqlClient';
import { QueryBuilder } from 'renia-graphql-client/builder';

const createMockResponse = (body: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init
  });
};

test('nagłówki z augmentera są dołączane do requestu GraphQL', async () => {
  const originalFetch = globalThis.fetch;
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return createMockResponse({ data: { ping: true } });
  }) as typeof fetch;

  registerGraphQLHeaderAugmenter((headers) => {
    headers.store = 'pl_default';
  });

  const localAugmenter = (headers: Record<string, string>) => {
    headers['x-test'] = 'enabled';
  };

  const response = await executeGraphQLRequest(
    {
      endpoint: 'https://example.magento/graphql',
      method: 'POST',
      payload: 'query Ping { ping }'
    },
    { augmenters: [localAugmenter] }
  );

  assert.equal(response.status, 200);
  assert.deepEqual(response.data, { ping: true });
  assert.equal(calls.length, 1);

  const sentHeaders = calls[0]?.init?.headers as Record<string, string>;
  assert.ok(sentHeaders, 'wysłane nagłówki powinny istnieć');
  assert.equal(sentHeaders.store, 'pl_default');
  assert.equal(sentHeaders['x-test'], 'enabled');
  assert.equal(sentHeaders['content-type'], 'application/json');

  globalThis.fetch = originalFetch;
});

test('augmentery zapytań modyfikują payload na podstawie operationId', async () => {
  const originalFetch = globalThis.fetch;
  let capturedBody: any = null;

  globalThis.fetch = (async (_url: string, init?: RequestInit) => {
    capturedBody = init?.body ? JSON.parse(String(init.body)) : null;
    return createMockResponse({ data: { ping: true } });
  }) as typeof fetch;

  registerGraphQLQueryAugmenter((payload, ctx) => {
    if (ctx.operationId !== 'test.ping') return;
    if (payload instanceof QueryBuilder) {
      payload.addField([], 'augmented_field');
    }
  });

  const builder = new QueryBuilder('query').setName('Ping');
  builder.addField([], 'ping');

  const response = await executeGraphQLRequest({
    endpoint: 'https://example.magento/graphql',
    method: 'POST',
    payload: builder,
    operationId: 'test.ping'
  });

  assert.equal(response.status, 200);
  assert.equal(response.data?.ping, true);
  assert.ok(capturedBody?.query.includes('augmented_field'));

  globalThis.fetch = originalFetch;
});
