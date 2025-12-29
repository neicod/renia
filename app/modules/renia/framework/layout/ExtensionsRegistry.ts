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
  /**
   * Insertion order fallback to keep deterministic rendering
   * (not meant to be relied on as a public API).
   */
  seq?: number;
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

const compareSortOrder = (a: ExtensionEntry, b: ExtensionEntry) => {
  const aBefore = a.sortOrder?.before;
  const bBefore = b.sortOrder?.before;
  const aAfter = a.sortOrder?.after;
  const bAfter = b.sortOrder?.after;

  // Direct relations between entries
  if (aBefore && aBefore === b.id) return -1;
  if (bBefore && bBefore === a.id) return 1;
  if (aAfter && aAfter === b.id) return 1;
  if (bAfter && bAfter === a.id) return -1;

  // Special anchor '-' (first/last)
  if (aBefore === '-' && bBefore !== '-') return -1;
  if (bBefore === '-' && aBefore !== '-') return 1;
  if (aAfter === '-' && bAfter !== '-') return 1;
  if (bAfter === '-' && aAfter !== '-') return -1;

  // Fallback: insertion order
  const aSeq = typeof a.seq === 'number' ? a.seq : 0;
  const bSeq = typeof b.seq === 'number' ? b.seq : 0;
  return aSeq - bSeq;
};

const sortEntries = (entries: ExtensionEntry[]) => {
  const copy = entries.slice();
  copy.sort((a, b) => compareSortOrder(a, b));
  return copy;
};

export class ExtensionsRegistry {
  private snapshot: ExtensionsSnapshot = {};
  private seq = 0;

  snapshotSorted(): ExtensionsSnapshot {
    const out: ExtensionsSnapshot = {};
    for (const [host, outlets] of Object.entries(this.snapshot)) {
      out[host] = {};
      for (const [outlet, entries] of Object.entries(outlets)) {
        out[host]![outlet] = sortEntries(entries).map(({ seq, ...e }) => ({ ...e }));
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
              list.push({ ...entry, seq: this.seq++ });
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
