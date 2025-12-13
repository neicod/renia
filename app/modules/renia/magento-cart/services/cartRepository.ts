// @env: mixed
import {
  addProductsToCart,
  createEmptyCart,
  fetchCart,
  removeItemFromCart,
  updateCartItems,
  type MagentoCart
} from './cartApi';

export type CartRepository = {
  createCart(): Promise<string>;
  addItems(cartId: string, items: { sku: string; quantity: number }[]): Promise<MagentoCart>;
  updateItems(
    cartId: string,
    items: { cartItemId: number; quantity: number }[]
  ): Promise<MagentoCart>;
  removeItem(cartId: string, cartItemId: number): Promise<MagentoCart>;
  fetch(cartId: string): Promise<MagentoCart>;
};

class MagentoCartRepository implements CartRepository {
  createCart(): Promise<string> {
    return createEmptyCart();
  }

  addItems(cartId: string, items: { sku: string; quantity: number }[]): Promise<MagentoCart> {
    return addProductsToCart(cartId, items);
  }

  updateItems(
    cartId: string,
    items: { cartItemId: number; quantity: number }[]
  ): Promise<MagentoCart> {
    return updateCartItems(cartId, items);
  }

  removeItem(cartId: string, cartItemId: number): Promise<MagentoCart> {
    return removeItemFromCart(cartId, cartItemId);
  }

  fetch(cartId: string): Promise<MagentoCart> {
    return fetchCart(cartId);
  }
}

export const cartRepository: CartRepository = new MagentoCartRepository();
