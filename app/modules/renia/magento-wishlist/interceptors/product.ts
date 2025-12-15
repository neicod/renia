// @env: server
export default function wishlistProductInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-view-actions', {
      componentPath: 'renia-magento-wishlist/components/WishlistHeart',
      priority: 20,
      props: { variant: 'pdp' }
    });
  }
}
