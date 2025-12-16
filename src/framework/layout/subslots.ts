// @env: mixed
export type SubslotEntry = {
  slot: string; // np. "category.main" / "product.sidebar"
  componentPath?: string;
  component?: string;
  id?: string;
  priority?: number;
  enabled?: boolean;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export type SubslotRegistry = Record<string, SubslotEntry[]>;

export const filterSubslots = (registry: SubslotRegistry, prefix: string): SubslotEntry[] => {
  const entries = registry[prefix] ?? [];
  return entries
    .filter((e) => e.enabled !== false)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
};
