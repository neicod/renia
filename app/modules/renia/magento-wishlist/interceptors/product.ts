// @env: server
export default function wishlistProductInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    api.subslots.add({
      slot: 'product-view-actions',
      componentPath: 'renia-magento-wishlist/components/WishlistHeart',
      priority: 20,
      props: { variant: 'pdp' }
    });
  }
}
