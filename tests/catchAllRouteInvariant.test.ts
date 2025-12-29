// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const stripComments = (code: string): string => {
  // Good-enough comment stripping for invariants (not a full TS parser).
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
};

const walkRouteFiles = (dir: string): string[] => {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'generated') continue;
      out.push(...walkRouteFiles(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (entry.name !== 'routes.ts' && entry.name !== 'routes.js') continue;
    out.push(full);
  }
  return out;
};

test('routing invariant: only renia-magento-routing may define catch-all "/*"', () => {
  const modulesRoot = path.join(repoRoot, 'app', 'modules');
  if (!fs.existsSync(modulesRoot)) return;

  const routeFiles = walkRouteFiles(modulesRoot);
  const offenders: string[] = [];
  const catchAllFiles: string[] = [];

  for (const file of routeFiles) {
    const raw = fs.readFileSync(file, 'utf8');
    const code = stripComments(raw);

    const hasCatchAll = /path\s*:\s*['"]\/\*['"]/.test(code);
    if (!hasCatchAll) continue;

    catchAllFiles.push(path.relative(repoRoot, file));

    // Enforce that the catch-all belongs to the Magento routing module.
    const expected = path.normalize('app/modules/renia/magento-routing/routes.ts');
    const rel = path.normalize(path.relative(repoRoot, file));
    if (rel !== expected) {
      offenders.push(rel);
      continue;
    }

    // Optional sanity: catch-all should have low priority to avoid shadowing app routes.
    const priorityMatch = code.match(/priority\s*:\s*(\d+)/);
    const priority = priorityMatch ? Number(priorityMatch[1]) : null;
    if (priority === null || !Number.isFinite(priority) || priority > 10) {
      offenders.push(`${rel} (priority should be <= 10)`);
    }
  }

  assert.deepEqual(offenders, []);
  assert.equal(catchAllFiles.length, 1);
});

