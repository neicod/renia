// @env: mixed
import React from 'react';
import { useCart } from 'renia-module-cart';
import { toggleCartSidebar } from '../services/cartSidebarStore';

export const CartSidebarToggle: React.FC = () => {
  const cart = useCart();
  const totalQty = cart.items.reduce((sum, item) => sum + (item.qty || 0), 0);

  return (
    <button
      type="button"
      onClick={() => toggleCartSidebar()}
      style={{
        border: '1px solid #cbd5f5',
        background: '#fff',
        padding: '0.45rem 0.9rem',
        borderRadius: '999px',
        cursor: 'pointer',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}
    >
      <span>Panel koszyka{totalQty ? ` (${totalQty})` : ''}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 6h15l-1.5 9h-12zm0 0L4 3H1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="21" r="1" fill="currentColor" />
        <circle cx="18" cy="21" r="1" fill="currentColor" />
      </svg>
    </button>
  );
};

export default CartSidebarToggle;
