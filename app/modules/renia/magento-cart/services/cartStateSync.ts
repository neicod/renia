// @env: mixed
import { cartStore } from 'renia-module-cart';
import type { CartItem } from 'renia-module-cart';
import type { MagentoCart } from './cartApi';
import { mapCartItems } from './cartMapper';

export interface CartStateSync {
  replaceWith(cart: MagentoCart): CartItem[];
  clear(): void;
}

class DefaultCartStateSync implements CartStateSync {
  replaceWith(cart: MagentoCart): CartItem[] {
    const mapped = mapCartItems(cart);
    cartStore.dispatch({ type: 'set', items: mapped });
    return mapped;
  }

  clear() {
    cartStore.dispatch({ type: 'set', items: [] });
  }
}

export const cartStateSync: CartStateSync = new DefaultCartStateSync();
