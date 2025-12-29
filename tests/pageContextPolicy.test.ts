// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldFetchPageContextPayload } from '@renia/framework/runtime/pageContextPolicy';

test('page context policy: mount fetch only when revalidate is needed', () => {
  assert.equal(
    shouldFetchPageContextPayload({ isFirstEffect: true, shouldRevalidateOnMount: true, activePath: '/wishlist' }),
    true
  );
  assert.equal(
    shouldFetchPageContextPayload({ isFirstEffect: true, shouldRevalidateOnMount: false, activePath: '/*' }),
    false
  );
});

test('page context policy: navigation fetch only for catch-all routes', () => {
  assert.equal(
    shouldFetchPageContextPayload({ isFirstEffect: false, shouldRevalidateOnMount: false, activePath: '/wishlist' }),
    false
  );
  assert.equal(
    shouldFetchPageContextPayload({ isFirstEffect: false, shouldRevalidateOnMount: false, activePath: '/search' }),
    false
  );
  assert.equal(
    shouldFetchPageContextPayload({ isFirstEffect: false, shouldRevalidateOnMount: false, activePath: '/*' }),
    true
  );
});
