// @env: server
import fs from 'node:fs';
import path from 'node:path';
import type { Messages } from './types';

const DIST_I18N_DIR = path.resolve(process.cwd(), 'dist', 'i18n');

const cache = new Map<string, Messages>();

export const loadMessages = (lang: string): Messages => {
  if (cache.has(lang)) return cache.get(lang)!;
  const file = path.join(DIST_I18N_DIR, `${lang}.json`);
  if (fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as Messages;
      cache.set(lang, parsed);
      return parsed;
    } catch {
      // ignore
    }
  }
  return {};
};
