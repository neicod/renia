// @env: mixed
export default function wishlistProductInterceptor(api: any = {}) {
  api.layout.get('product-view-actions').add('renia-magento-wishlist/components/WishlistHeart', 'wishlist-heart', {
    sortOrder: { before: '-' },
    props: { variant: 'pdp' }
  });
}
