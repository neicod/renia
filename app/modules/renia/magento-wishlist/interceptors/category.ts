// @env: mixed
export default function wishlistCategoryInterceptor(api: any = {}) {
  api.layout.get('product-listing-actions').add('renia-magento-wishlist/components/WishlistHeart', 'wishlist-heart', {
    sortOrder: { before: '-' }
  });
}
