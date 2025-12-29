// @env: mixed
import type { CartItem } from 'renia-module-cart';
import type { MagentoCart, CartItemInput } from './cartApi';
import { cartRepository, type CartRepository } from './cartRepository';
import { cartStateSync, type CartStateSync } from './cartStateSync';
import { cartIdStorage, type CartIdStorage } from './cartIdStorage';

export type CartOperation = 'add' | 'update' | 'remove' | 'refresh';
export type CartErrorHandler = (context: { operation: CartOperation; error: unknown }) =>
  | void
  | Promise<void>;

const cartErrorHandlers = new Set<CartErrorHandler>();

export const registerCartErrorHandler = (handler: CartErrorHandler) => {
  if (typeof handler !== 'function') return () => undefined;
  cartErrorHandlers.add(handler);
  return () => cartErrorHandlers.delete(handler);
};

const notifyCartErrorHandlers = async (operation: CartOperation, error: unknown) => {
  await Promise.all(
    Array.from(cartErrorHandlers).map(async (handler) => {
      try {
        await handler({ operation, error });
      } catch (notifyError) {
        console.error('[cartManager] error handler failed', notifyError);
      }
    })
  );
};

const toCartItemId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export type CartManagerDependencies = {
  repository: CartRepository;
  stateSync: CartStateSync;
  idStorage: CartIdStorage;
};

export class CartManager {
  private readonly repository: CartRepository;
  private readonly stateSync: CartStateSync;
  private readonly idStorage: CartIdStorage;

  constructor(deps: CartManagerDependencies) {
    this.repository = deps.repository;
    this.stateSync = deps.stateSync;
    this.idStorage = deps.idStorage;
  }

  private async ensureCartId(): Promise<string> {
    const existing = this.idStorage.read();
    if (existing) return existing;
    const created = await this.repository.createCart();
    this.idStorage.write(created);
    return created;
  }

  private requireCartId(): string {
    const id = this.idStorage.read();
    if (!id) {
      throw new Error('Koszyk nie istnieje.');
    }
    return id;
  }

  private replaceCart(cart: MagentoCart): CartItem[] {
    return this.stateSync.replaceWith(cart);
  }

  async addProduct(options: CartItemInput) {
    const cartId = await this.ensureCartId();
    try {
      const cart = await this.repository.addItems(cartId, [options]);
      this.replaceCart(cart);
      return cart;
    } catch (error) {
      await notifyCartErrorHandlers('add', error);
      throw error;
    }
  }

  async updateItemQuantity(options: { cartItemId: number | string; quantity: number }) {
    const cartId = this.requireCartId();
    const cartItemId = toCartItemId(options.cartItemId);
    if (!cartItemId) {
      throw new Error('Brak identyfikatora pozycji koszyka.');
    }
    try {
      const cart = await this.repository.updateItems(cartId, [
        {
          cartItemId,
          quantity: Math.max(1, Number(options.quantity) || 1)
        }
      ]);
      this.replaceCart(cart);
      return cart;
    } catch (error) {
      await notifyCartErrorHandlers('update', error);
      throw error;
    }
  }

  async removeItem(options: { cartItemId: number | string }) {
    const cartId = this.requireCartId();
    const cartItemId = toCartItemId(options.cartItemId);
    if (!cartItemId) {
      throw new Error('Brak identyfikatora pozycji koszyka.');
    }
    try {
      const cart = await this.repository.removeItem(cartId, cartItemId);
      this.replaceCart(cart);
      return cart;
    } catch (error) {
      await notifyCartErrorHandlers('remove', error);
      throw error;
    }
  }

  async refreshCart() {
    const cartId = this.idStorage.read();
    if (!cartId) {
      this.stateSync.clear();
      return null;
    }
    try {
      const cart = await this.repository.fetch(cartId);
      this.replaceCart(cart);
      return cart;
    } catch (error) {
      this.idStorage.clear();
      this.stateSync.clear();
      await notifyCartErrorHandlers('refresh', error);
      throw error;
    }
  }

  clear() {
    this.idStorage.clear();
    this.stateSync.clear();
  }
}

const defaultCartManager = new CartManager({
  repository: cartRepository,
  stateSync: cartStateSync,
  idStorage: cartIdStorage
});

export const cartManager = defaultCartManager;
export default cartManager;
