// @env: server
export default function wishlistCategoryInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-listing-actions', {
      componentPath: 'renia-magento-wishlist/components/WishlistHeart',
      priority: 15
    });
  }
}
