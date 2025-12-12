// @env: server
import fs from 'node:fs';
import path from 'node:path';
import type { RouteDefinition } from './types';

const defaultRouteFiles = ['routes.ts', 'routes.js'];

export const pickRoutesFile = (moduleDir: string, explicit?: string): string | null => {
  if (explicit) {
    const candidate = path.resolve(moduleDir, explicit);
    return fs.existsSync(candidate) ? candidate : null;
  }
  for (const filename of defaultRouteFiles) {
    const candidate = path.resolve(moduleDir, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

export const readRoutesFile = async (filePath: string): Promise<RouteDefinition[] | null> => {
  if (!fs.existsSync(filePath)) return null;
  try {
    if (filePath.endsWith('.json')) {
      const raw = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    }
    const imported = await import(filePath);
    const data = imported?.default ?? imported;
    if (Array.isArray(data)) return data as RouteDefinition[];
    if (Array.isArray(data?.routes)) return data.routes as RouteDefinition[];
  } catch (error) {
    console.warn(`Nie udało się wczytać tras z ${filePath}:`, error);
  }
  return null;
};
