// @env: server
export default function wishlistCategoryInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    api.subslots.add({
      slot: 'product-listing-actions',
      componentPath: 'renia-magento-wishlist/components/WishlistHeart',
      priority: 15
    });
  }
}
