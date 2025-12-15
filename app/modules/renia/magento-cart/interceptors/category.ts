// @env: server
export default function categoryInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    api.subslots.add({
      slot: 'product-listing-actions',
      componentPath: 'renia-magento-cart/components/AddToCartButton',
      category: 'simple-product-actions',
      priority: 10,
      props: {}
    });
  }
}
