// @env: mixed
import type { Product } from 'renia-magento-product/types';
import { wishlistStorage, isSnapshotExpired } from './wishlistStorage';
import type { WishlistListener, WishlistSnapshot, WishlistToggleResult } from './types';
import { createSnapshotFromProduct } from './wishlistSnapshot';

const listeners = new Set<WishlistListener>();
let snapshots: WishlistSnapshot[] = wishlistStorage.read();

const emit = () => {
  const current = snapshots.slice();
  listeners.forEach((listener) => listener(current));
};

const persist = () => {
  wishlistStorage.write(snapshots);
};

const upsertSnapshot = (snapshot: WishlistSnapshot) => {
  const idx = snapshots.findIndex((item) => item.sku === snapshot.sku);
  if (idx >= 0) {
    snapshots[idx] = { ...snapshot, updatedAt: Date.now() };
  } else {
    snapshots = [...snapshots, snapshot];
  }
  persist();
  emit();
};

const removeSnapshot = (sku: string) => {
  const next = snapshots.filter((item) => item.sku !== sku);
  if (next.length !== snapshots.length) {
    snapshots = next;
    persist();
    emit();
  }
};

export const wishlistStore = {
  getItems(): WishlistSnapshot[] {
    return snapshots.slice();
  },
  subscribe(listener: WishlistListener) {
    listeners.add(listener);
    listener(snapshots.slice());
    return () => listeners.delete(listener);
  },
  has(sku?: string) {
    if (!sku) return false;
    return snapshots.some((item) => item.sku === sku);
  },
  toggle(product: Product): WishlistToggleResult {
    if (!product?.sku) return { added: false };
    const exists = this.has(product.sku);
    if (exists) {
      removeSnapshot(product.sku);
      return { added: false };
    }
    const snapshot = createSnapshotFromProduct(product);
    upsertSnapshot(snapshot);
    return { added: true, snapshot };
  },
  remove(sku: string) {
    removeSnapshot(sku);
  },
  replaceSnapshots(items: WishlistSnapshot[]) {
    snapshots = items.slice();
    persist();
    emit();
  },
  refreshFromProducts(products: Product[]) {
    if (!products.length) return;
    const map = new Map(products.map((p) => [p.sku, createSnapshotFromProduct(p)]));
    snapshots = snapshots.map((item) => map.get(item.sku) ?? item);
    persist();
    emit();
  },
  getExpiredSkus(now = Date.now()) {
    return snapshots.filter((item) => isSnapshotExpired(item, now)).map((item) => item.sku);
  },
  hasExpiredItems(now = Date.now()) {
    return snapshots.some((item) => isSnapshotExpired(item, now));
  }
};

export default wishlistStore;
