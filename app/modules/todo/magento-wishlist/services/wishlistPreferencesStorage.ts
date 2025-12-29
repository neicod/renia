// @env: mixed
import browserStorage from '@renia/framework/storage/browserStorage';

const STORAGE_KEY = 'wishlist.preferences';

type WishlistPreferences = {
  pageSize?: number;
};

const safeParse = (raw: string | null): WishlistPreferences => {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    if (data && typeof data === 'object') {
      return {
        pageSize: typeof (data as any).pageSize === 'number' ? (data as any).pageSize : undefined
      };
    }
  } catch {
    // ignore
  }
  return {};
};

const read = (): WishlistPreferences => safeParse(browserStorage.getItem(STORAGE_KEY));

const write = (next: WishlistPreferences) => {
  try {
    browserStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('[wishlistPreferencesStorage] Failed to persist preferences', error);
  }
};

export const wishlistPreferencesStorage = {
  read,
  write
};

export default wishlistPreferencesStorage;

