// @env: mixed
export type SubslotEntry = {
  slot: string; // np. "category.main" / "product.sidebar"
  componentPath?: string;
  component?: string;
  id?: string;
  priority?: number;
  enabled?: boolean;
  category?: string;
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

export const filterSubslotsByCategory = (entries: SubslotEntry[]): SubslotEntry[] => {
  // Najpierw filtruj enabled !== false
  const enabled = entries.filter((e) => e.enabled !== false);

  // Grupuj po kategorii
  const byCategory = new Map<string, SubslotEntry[]>();
  for (const entry of enabled) {
    const category = entry.category ?? 'default';
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(entry);
  }

  // Jeśli jest wiele kategorii, zostaw tylko tę z najwyższym priorytetem
  if (byCategory.size > 1) {
    let maxPriority = -Infinity;
    let maxCategory: string = 'default';

    for (const [category, categoryEntries] of byCategory.entries()) {
      const maxPrio = Math.max(...categoryEntries.map((e) => e.priority ?? 0), -Infinity);
      if (maxPrio > maxPriority) {
        maxPriority = maxPrio;
        maxCategory = category;
      }
    }

    // Zwróć tylko components z kategorii z najwyższym priorytetem
    const chosen = byCategory.get(maxCategory) ?? [];
    return chosen.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  // Jeśli tylko jedna kategoria, zwróć sortowaną
  const categoryEntries = Array.from(byCategory.values())[0] ?? [];
  return categoryEntries.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
};
