// @env: mixed
import React from 'react';
import { useCart } from 'renia-module-cart';
import {
  readCartQuantitySummary,
  subscribeToCartQuantity,
  type CartQuantitySummary
} from 'renia-module-cart/services/cartStore';

const useCartQuantity = () => {
  const cart = useCart();
  const liveQty = cart.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const [cachedSummary, setCachedSummary] = React.useState<CartQuantitySummary | null>(() =>
    readCartQuantitySummary()
  );

  React.useEffect(() => subscribeToCartQuantity(setCachedSummary), []);

  return liveQty || cachedSummary?.qty || 0;
};

export const CartControlLink: React.FC = () => {
  const totalQty = useCartQuantity();
  return (
    <a href="/cart" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600 }}>
      Koszyk{totalQty ? ` (${totalQty})` : ''}
    </a>
  );
};

export default CartControlLink;
