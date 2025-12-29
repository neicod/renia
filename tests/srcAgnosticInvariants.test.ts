// @env: node
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const walkTextFiles = (dir: string): string[] => {
  const out: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'generated') continue;
      out.push(...walkTextFiles(full));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!/\.(ts|tsx|js|jsx|md|json|css|scss|html|txt)$/i.test(entry.name)) continue;
    out.push(full);
  }
  return out;
};

const findAll = (content: string, re: RegExp): Array<{ index: number; match: string }> => {
  const out: Array<{ index: number; match: string }> = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
  while ((m = r.exec(content))) {
    out.push({ index: m.index, match: m[0] });
    if (m.index === r.lastIndex) r.lastIndex++;
  }
  return out;
};

const indexToLine = (content: string, index: number): number => {
  // 1-based line number.
  let line = 1;
  for (let i = 0; i < content.length && i < index; i++) {
    if (content.charCodeAt(i) === 10) line++;
  }
  return line;
};

test('framework invariant: core must stay integration-agnostic (no MAGENTO_* / renia-magento-*)', () => {
  const frameworkRoot = path.join(repoRoot, 'app', 'modules', 'renia', 'framework');
  if (!fs.existsSync(frameworkRoot)) return;

  const files = walkTextFiles(frameworkRoot);
  const offenders: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');

    const matches = [
      ...findAll(content, /\bMAGENTO_[A-Z0-9_]+\b/g),
      ...findAll(content, /\brenia-magento-[a-z0-9-]+\b/gi),
      ...findAll(content, /\breni[a-z0-9-]*magento[a-z0-9-]*\b/gi)
    ];

    if (!matches.length) continue;

    const rel = path.relative(repoRoot, file);
    for (const m of matches.slice(0, 20)) {
      offenders.push(`${rel}:${indexToLine(content, m.index)}:${m.match}`);
    }
    if (matches.length > 20) offenders.push(`${rel}:... (${matches.length - 20} more)`);
  }

  assert.deepEqual(offenders, []);
});
