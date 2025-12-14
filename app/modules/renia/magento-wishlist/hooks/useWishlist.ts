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
  // Initialize with empty array on both SSR and CSR to ensure hydration match
  // The effect below will load from store on CSR only
  const [items, setItems] = React.useState<WishlistSnapshot[]>([]);

  React.useEffect(() => {
    // Only load from store and subscribe on CSR (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    // Load initial items from store
    setItems(wishlistStore.getItems());

    // Subscribe to store updates
    return wishlistStore.subscribe(setItems);
  }, []);

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
