// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const walkFiles = (dir: string, predicate: (fullPath: string, stat: fs.Stats) => boolean): string[] => {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    let stat: fs.Stats;
    try {
      stat = fs.lstatSync(full);
    } catch {
      continue;
    }

    if (entry.isSymbolicLink()) {
      // Skip symlinks to avoid surprises and to keep traversal deterministic.
      continue;
    }

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'generated') {
        continue;
      }
      out.push(...walkFiles(full, predicate));
      continue;
    }

    if (entry.isFile() && predicate(full, stat)) {
      out.push(full);
    }
  }
  return out;
};

test('skeleton invariant: no nested node_modules inside app/modules', () => {
  const modulesRoot = path.join(repoRoot, 'app', 'modules');
  if (!fs.existsSync(modulesRoot)) return;

  const found: string[] = [];
  const walkDirs = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (!entry.isDirectory()) continue;
      if (entry.name === 'node_modules') {
        found.push(full);
        continue;
      }
      walkDirs(full);
    }
  };

  walkDirs(modulesRoot);
  assert.deepEqual(found, []);
});

test('skeleton invariant: interceptors must not use api.layout.get()', () => {
  const interceptorsRoot = path.join(repoRoot, 'app', 'modules');
  if (!fs.existsSync(interceptorsRoot)) return;

  const files = walkFiles(interceptorsRoot, (full) => {
    if (!full.includes(`${path.sep}interceptors${path.sep}`)) return false;
    return full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js');
  });

  const offenders: string[] = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    if (/\bapi\.layout\.get\s*\(/.test(content) || /\bapi\.layout\s*\.\s*get\s*\(/.test(content)) {
      offenders.push(path.relative(repoRoot, file));
    }
  }

  assert.deepEqual(offenders, []);
});
