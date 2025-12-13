// @env: mixed
import browserStorage from '@framework/storage/browserStorage';

const STORAGE_KEY = 'renia.magento.cartId';
const CART_ID_TTL_MS = 7 * 24 * 60 * 60 * 1000; // tydzień

let memoryCartId: { id: string; updatedAt: number } | null = null;
const isBrowser = typeof window !== 'undefined';

const now = () => Date.now();

const isValid = (updatedAt: number) => now() - updatedAt <= CART_ID_TTL_MS;

export interface CartIdStorage {
  read(): string | null;
  write(cartId: string): void;
  clear(): void;
}

class DefaultCartIdStorage implements CartIdStorage {
  read(): string | null {
    if (isBrowser) {
      const raw = browserStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.id === 'string' && typeof parsed.updatedAt === 'number') {
          if (isValid(parsed.updatedAt)) {
            return parsed.id;
          }
          this.clear();
          return null;
        }
      } catch {
        return null;
      }
      return null;
    }
    if (memoryCartId && isValid(memoryCartId.updatedAt)) {
      return memoryCartId.id;
    }
    return null;
  }

  write(cartId: string) {
    const payload = JSON.stringify({ id: cartId, updatedAt: now() });
    if (isBrowser) {
      browserStorage.setItem(STORAGE_KEY, payload);
    } else {
      memoryCartId = { id: cartId, updatedAt: now() };
    }
  }

  clear() {
    if (isBrowser) {
      browserStorage.removeItem(STORAGE_KEY);
    }
    memoryCartId = null;
  }
}

export const cartIdStorage: CartIdStorage = new DefaultCartIdStorage();
