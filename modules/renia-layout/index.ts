import fs from 'node:fs';
import path from 'node:path';
import { loadModuleRegistry } from 'renia-module-registry';

export type SlotDefinition = {
  slot: string;
  component: string;
  priority?: number;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type SlotEntry = SlotDefinition & { module: string };

export type LayoutRegistry = {
  slots: Record<string, SlotEntry[]>;
  flat: SlotEntry[];
};

export const builtinLayouts = {
  '1column': {
    slots: ['control-menu', 'main']
  }
};

export type LayoutOptions = {
  layoutFileName?: string; // domyślnie layout.ts / layout.js / layout.json
  configPath?: string;
  includeNodeModules?: boolean;
  statusMap?: Record<string, boolean | number | undefined>;
};

const defaultLayoutFiles = ['layout.ts', 'layout.js', 'layout.json'];

const isEqual = (a: unknown, b: unknown): boolean => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

const pickLayoutFile = (moduleDir: string, explicit?: string): string | null => {
  if (explicit) {
    const candidate = path.resolve(moduleDir, explicit);
    return fs.existsSync(candidate) ? candidate : null;
  }
  for (const filename of defaultLayoutFiles) {
    const candidate = path.resolve(moduleDir, filename);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

const readLayoutFile = async (filePath: string): Promise<SlotDefinition[] | null> => {
  if (!fs.existsSync(filePath)) return null;
  try {
    if (filePath.endsWith('.json')) {
      const raw = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    }
    const imported = await import(filePath);
    const data = imported?.default ?? imported;
    if (Array.isArray(data)) return data as SlotDefinition[];
    if (Array.isArray(data?.slots)) return data.slots as SlotDefinition[];
  } catch (error) {
    console.warn(`Nie udało się wczytać layoutu z ${filePath}:`, error);
  }
  return null;
};

const normalizeDefinition = (def: SlotDefinition): SlotDefinition | null => {
  if (!def || typeof def !== 'object') return null;
  if (typeof def.slot !== 'string' || !def.slot.trim()) return null;
  if (typeof def.component !== 'string' || !def.component.trim()) return null;

  return {
    slot: def.slot,
    component: def.component,
    priority: def.priority ?? 0,
    props: def.props && typeof def.props === 'object' ? def.props : undefined,
    meta: def.meta && typeof def.meta === 'object' ? def.meta : undefined
  };
};

const mergeSlots = (entries: SlotEntry[]): SlotEntry[] => {
  const seen = new Map<string, SlotEntry>();
  for (const entry of entries) {
    const key = `${entry.slot}::${entry.component}::${entry.priority ?? 0}`;
    if (!seen.has(key)) {
      seen.set(key, entry);
    } else {
      const existing = seen.get(key)!;
      if (!isEqual(existing, entry)) {
        console.warn(
          `Kolizja slotu "${entry.slot}" dla komponentu ${entry.component} (moduły: ${existing.module} / ${entry.module}) — pomijam duplikat.`
        );
      }
    }
  }
  const unique = Array.from(seen.values());
  unique.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  return unique;
};

export const loadLayoutRegistry = async (options: LayoutOptions = {}): Promise<LayoutRegistry> => {
  const { layoutFileName, configPath, includeNodeModules, statusMap } = options;

  const modules = await loadModuleRegistry({
    configPath,
    includeNodeModules,
    statusMap
  });

  const activeModules = modules.filter((m) => m.enabled);
  const entries: SlotEntry[] = [];

  for (const mod of activeModules) {
    const layoutFile = pickLayoutFile(mod.path, layoutFileName);
    if (!layoutFile) continue;

    const definitions = await readLayoutFile(layoutFile);
    if (!definitions || definitions.length === 0) continue;

    for (const def of definitions) {
      const normalized = normalizeDefinition(def);
      if (!normalized) continue;
      entries.push({ ...normalized, module: mod.name });
    }
  }

  const merged = mergeSlots(entries);
  const slots: Record<string, SlotEntry[]> = {};
  for (const entry of merged) {
    if (!slots[entry.slot]) slots[entry.slot] = [];
    slots[entry.slot].push(entry);
  }

  return { slots, flat: merged };
};
