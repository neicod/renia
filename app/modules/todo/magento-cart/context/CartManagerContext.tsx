// @env: mixed
import React from 'react';
import cartManager, { type CartManager } from '../services/cartManager';

type CartManagerContextValue = CartManager;

const CartManagerContext = React.createContext<CartManagerContextValue>(cartManager);

export const CartManagerProvider: React.FC<{
  manager: CartManager;
  children: React.ReactNode;
}> = ({ manager, children }) => {
  return <CartManagerContext.Provider value={manager}>{children}</CartManagerContext.Provider>;
};

export const useCartManager = () => {
  return React.useContext(CartManagerContext);
};

export default CartManagerContext;
