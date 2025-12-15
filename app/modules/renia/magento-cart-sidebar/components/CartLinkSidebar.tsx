// @env: mixed
import React from 'react';
import { useCart } from 'renia-module-cart';
import { toggleCartSidebar, openCartSidebar } from '../services/cartSidebarStore';

const CartLinkSidebar: React.FC = () => {
  const cart = useCart();
  const totalQty = cart.items.reduce((sum, item) => sum + (item.qty || 0), 0);

  const onClick = React.useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    const isCartPage =
      typeof window !== 'undefined' &&
      window.location &&
      window.location.pathname &&
      window.location.pathname.startsWith('/cart');
    if (isCartPage) {
      return;
    }
    event.preventDefault();
    openCartSidebar();
  }, []);

  return (
    <a
      href="/cart"
      onClick={onClick}
      style={{
        textDecoration: 'none',
        color: '#0f172a',
        fontWeight: 600,
        position: 'relative'
      }}
      aria-label="Koszyk"
    >
      Koszyk
      <span
        style={{
          marginLeft: '0.35rem',
          display: totalQty > 0 ? 'inline-flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '22px',
          height: '22px',
          padding: '0 6px',
          borderRadius: '999px',
          background: '#2563eb',
          color: '#fff',
          fontSize: '0.8rem',
          fontWeight: 700,
          lineHeight: 1
        }}
      >
        {totalQty}
      </span>
    </a>
  );
};

export default CartLinkSidebar;
