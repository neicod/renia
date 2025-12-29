// @env: mixed
import browserStorage from '@renia/framework/storage/browserStorage';
import type { WishlistSnapshot } from './types';
import { SNAPSHOT_TTL_MS } from './types';

const STORAGE_KEY = 'wishlist.items';

const safeParse = (raw: string | null): WishlistSnapshot[] => {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data
        .map((item: any) =>
          item && typeof item.sku === 'string'
            ? {
                sku: item.sku,
                productId: item.productId,
                urlKey: item.urlKey,
                name: item.name,
                thumbnail: item.thumbnail,
                price: item.price,
                priceOriginal: item.priceOriginal,
                updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now()
              }
            : null
        )
        .filter(Boolean) as WishlistSnapshot[];
    }
  } catch (error) {
    console.warn('[wishlistStorage] Failed to parse storage', error);
  }
  return [];
};

const persist = (items: WishlistSnapshot[]) => {
  try {
    browserStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('[wishlistStorage] Failed to persist wishlist', error);
  }
};

export const wishlistStorage = {
  read(): WishlistSnapshot[] {
    const raw = browserStorage.getItem(STORAGE_KEY);
    return safeParse(raw);
  },
  write(items: WishlistSnapshot[]) {
    persist(items);
  },
  clear() {
    browserStorage.removeItem(STORAGE_KEY);
  }
};

export const isSnapshotExpired = (snapshot: WishlistSnapshot, now = Date.now()) =>
  now - snapshot.updatedAt > SNAPSHOT_TTL_MS;

export default wishlistStorage;
