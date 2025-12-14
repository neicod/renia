// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { wishlistStore } from '../services/wishlistStore';
import type { WishlistSnapshot, WishlistToggleResult } from '../services/types';

export type UseWishlistResult = {
  items: WishlistSnapshot[];
  has: (sku?: string) => boolean;
  toggle: (product: Product) => WishlistToggleResult;
  remove: (sku: string) => void;
};

export const useWishlist = (): UseWishlistResult => {
  const [items, setItems] = React.useState<WishlistSnapshot[]>(() => wishlistStore.getItems());

  React.useEffect(() => wishlistStore.subscribe(setItems), []);

  return React.useMemo(
    () => ({
      items,
      has: (sku?: string) => wishlistStore.has(sku),
      toggle: (product: Product) => wishlistStore.toggle(product),
      remove: (sku: string) => wishlistStore.remove(sku)
    }),
    [items]
  );
};

export default useWishlist;
