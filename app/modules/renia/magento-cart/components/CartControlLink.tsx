// @env: mixed
import React from 'react';
import { useCart } from 'renia-module-cart';
import {
  readCartQuantitySummary,
  subscribeToCartQuantity,
  type CartQuantitySummary
} from 'renia-module-cart/services/cartStore';
import { useI18n } from 'renia-i18n/hooks/useI18n';

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
  const { t } = useI18n();
  return (
    <a href="/cart" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600 }}>
      {t('cart.link')}{totalQty ? ` (${totalQty})` : ''}
    </a>
  );
};

export default CartControlLink;
