// @env: server
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ExtensionsRegistry } from '@renia/framework/layout';

describe('ExtensionsRegistry', () => {
  test('sortOrder before/after controls order', () => {
    const reg = new ExtensionsRegistry();

    reg.component('Host').outlet('actions').add('CompB', 'b');
    reg.component('Host').outlet('actions').add('CompA', 'a', { sortOrder: { before: 'b' } });
    reg.component('Host').outlet('actions').add('CompC', 'c', { sortOrder: { after: 'b' } });

    const entries = reg.get('Host', 'actions');
    assert.deepEqual(entries.map((e) => e.id), ['a', 'b', 'c']);
  });

  test('disable hides entry', () => {
    const reg = new ExtensionsRegistry();
    reg.component('Host').outlet('actions').add('CompA', 'a');
    reg.component('Host').outlet('actions').disable('a');
    assert.deepEqual(reg.get('Host', 'actions').map((e) => e.id), []);
  });

  test('snapshotSorted returns sorted snapshot', () => {
    const reg = new ExtensionsRegistry();
    reg.component('Host').outlet('actions').add('CompB', 'b');
    reg.component('Host').outlet('actions').add('CompA', 'a', { sortOrder: { before: 'b' } });

    const snap = reg.snapshotSorted();
    assert.deepEqual(snap.Host.actions.map((e) => e.id), ['a', 'b']);
  });
});

