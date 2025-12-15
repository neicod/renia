// @env: server
export default function wishlistProductInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-view-actions-universal', {
      componentPath: 'renia-magento-wishlist/components/WishlistHeart',
      priority: 20,
      props: { variant: 'pdp' }
    });
  }
}
