// @env: mixed
import type { Product } from 'magento-product/types';
import type { WishlistSnapshot } from './types';

export const createSnapshotFromProduct = (product: Product): WishlistSnapshot => ({
  sku: product.sku,
  productId: product.id,
  urlKey: product.urlKey ?? product.urlPath,
  name: product.name,
  thumbnail: product.thumbnail,
  price: product.price,
  priceOriginal: product.priceOriginal,
  updatedAt: Date.now()
});

export default createSnapshotFromProduct;
