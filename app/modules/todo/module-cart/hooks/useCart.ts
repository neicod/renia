// @env: mixed
import React from 'react';
import { cartStore, type CartState } from '../services/cartStore';

const getSnapshot = () => cartStore.getState();

export const useCart = (): CartState => {
  return React.useSyncExternalStore(cartStore.subscribe, getSnapshot, getSnapshot);
};

export default useCart;
