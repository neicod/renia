// @env: mixed
import type { SortOrder } from './LayoutTree';

export type ExtensionEntry = {
  host: string;
  outlet: string;
  id: string;
  componentPath: string;
  enabled?: boolean;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  sortOrder?: SortOrder;
};

export type ExtensionsSnapshot = Record<string, Record<string, ExtensionEntry[]>>;

const ensureHost = (snapshot: ExtensionsSnapshot, host: string) => {
  if (!snapshot[host]) snapshot[host] = {};
  return snapshot[host]!;
};

const ensureOutlet = (snapshot: ExtensionsSnapshot, host: string, outlet: string) => {
  const hostMap = ensureHost(snapshot, host);
  if (!hostMap[outlet]) hostMap[outlet] = [];
  return hostMap[outlet]!;
};

const compareSortOrder = (a: ExtensionEntry, b: ExtensionEntry, all: ExtensionEntry[]) => {
  const aOrder = a.sortOrder ? Object.values(a.sortOrder)[0] : '-';
  const bOrder = b.sortOrder ? Object.values(b.sortOrder)[0] : '-';

  if (aOrder === '-' && bOrder === '-') return 0;
  if (aOrder === '-') return -1;
  if (bOrder === '-') return 1;

  if (a.sortOrder?.before && a.sortOrder.before === b.id) return -1;
  if (b.sortOrder?.before && b.sortOrder.before === a.id) return 1;
  if (a.sortOrder?.after && a.sortOrder.after === b.id) return 1;
  if (b.sortOrder?.after && b.sortOrder.after === a.id) return -1;

  return 0;
};

const sortEntries = (entries: ExtensionEntry[]) => {
  const copy = entries.slice();
  copy.sort((a, b) => compareSortOrder(a, b, copy));
  return copy;
};

export class ExtensionsRegistry {
  private snapshot: ExtensionsSnapshot = {};

  snapshotSorted(): ExtensionsSnapshot {
    const out: ExtensionsSnapshot = {};
    for (const [host, outlets] of Object.entries(this.snapshot)) {
      out[host] = {};
      for (const [outlet, entries] of Object.entries(outlets)) {
        out[host]![outlet] = sortEntries(entries).map((e) => ({ ...e }));
      }
    }
    return out;
  }

  component(host: string) {
    return {
      outlet: (outlet: string) => {
        return {
          add: (
            componentPath: string,
            id: string,
            options?: {
              sortOrder?: SortOrder;
              props?: Record<string, unknown>;
              meta?: Record<string, unknown>;
              enabled?: boolean;
            }
          ) => {
            const list = ensureOutlet(this.snapshot, host, outlet);
            const entry: ExtensionEntry = {
              host,
              outlet,
              id,
              componentPath,
              enabled: options?.enabled ?? true,
              props: options?.props,
              meta: options?.meta,
              sortOrder: options?.sortOrder
            };

            const idx = list.findIndex((e) => e.id === id);
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...entry };
            } else {
              list.push(entry);
            }
          },
          remove: (id: string) => {
            const list = ensureOutlet(this.snapshot, host, outlet);
            const next = list.filter((e) => e.id !== id);
            ensureHost(this.snapshot, host)[outlet] = next;
          },
          enable: (id: string) => {
            const list = ensureOutlet(this.snapshot, host, outlet);
            const idx = list.findIndex((e) => e.id === id);
            if (idx >= 0) list[idx] = { ...list[idx], enabled: true };
          },
          disable: (id: string) => {
            const list = ensureOutlet(this.snapshot, host, outlet);
            const idx = list.findIndex((e) => e.id === id);
            if (idx >= 0) list[idx] = { ...list[idx], enabled: false };
          },
          clear: () => {
            ensureHost(this.snapshot, host)[outlet] = [];
          }
        };
      }
    };
  }

  get(host: string, outlet: string): ExtensionEntry[] {
    const list = this.snapshot?.[host]?.[outlet] ?? [];
    return sortEntries(list).filter((e) => e.enabled !== false);
  }
}

export default ExtensionsRegistry;
