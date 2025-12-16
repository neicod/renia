import fs from 'node:fs';
import path from 'node:path';
import deepEqual from 'fast-deep-equal';

const ROOT = process.cwd();
const APP_I18N_DIR = path.join(ROOT, 'app', 'i18n');
const MODULES_DIR = path.join(ROOT, 'app', 'modules');
const OUTPUT_DIR = path.join(ROOT, 'dist', 'i18n');

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};

const collectModulePacks = () => {
  const packs = new Map(); // lang -> array of objects
  if (!fs.existsSync(MODULES_DIR)) return packs;
  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue;
        const i18nDir = path.join(full, 'i18n');
        if (fs.existsSync(i18nDir) && fs.statSync(i18nDir).isDirectory()) {
          for (const file of fs.readdirSync(i18nDir)) {
            if (!file.endsWith('.json')) continue;
            if (file === 'package.json') continue;
            const lang = file.replace(/\.json$/, '');
            const data = readJson(path.join(i18nDir, file)) || {};
            if (!packs.has(lang)) packs.set(lang, []);
            packs.get(lang).push(data);
          }
        }
        walk(full);
      }
    }
  };
  walk(MODULES_DIR);
  return packs;
};

const collectAppOverrides = () => {
  const overrides = new Map();
  if (!fs.existsSync(APP_I18N_DIR)) return overrides;
  for (const file of fs.readdirSync(APP_I18N_DIR)) {
    if (!file.endsWith('.json')) continue;
    const lang = file.replace(/\.json$/, '');
    const data = readJson(path.join(APP_I18N_DIR, file)) || {};
    overrides.set(lang, data);
  }
  return overrides;
};

const mergeMessages = (baseList = [], override = {}) => {
  const merged = Object.assign({}, ...baseList, override);
  return merged;
};

const main = () => {
  ensureDir(OUTPUT_DIR);
  const modulePacks = collectModulePacks();
  const overrides = collectAppOverrides();
  const allLangs = new Set([...modulePacks.keys(), ...overrides.keys(), 'en_US']);

  let changed = false;

  for (const lang of allLangs) {
    const moduleMsgs = modulePacks.get(lang) ?? [];
    const overrideMsgs = overrides.get(lang) ?? {};
    const merged = mergeMessages(moduleMsgs, overrideMsgs);
    const outPath = path.join(OUTPUT_DIR, `${lang}.json`);
    const prev = readJson(outPath);
    if (!prev || !deepEqual(prev, merged)) {
      fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
      changed = true;
      console.log(`i18n: wrote ${outPath}`);
    }
  }
  if (!changed) {
    console.log('i18n: no changes');
  }
};

main();
