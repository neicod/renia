// @env: mixed
import type { Product } from 'renia-magento-product/types';

export type WishlistSnapshot = {
  sku: string;
  productId?: string;
  urlKey?: string;
  name: string;
  thumbnail?: Product['thumbnail'];
  price?: Product['price'];
  priceOriginal?: Product['priceOriginal'];
  updatedAt: number;
};

export type WishlistListener = (items: WishlistSnapshot[]) => void;

export type WishlistToggleResult = {
  added: boolean;
  snapshot?: WishlistSnapshot;
};

export const SNAPSHOT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
