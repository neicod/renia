// @env: server
export default function productInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    api.subslots.add({
      slot: 'product-view-actions',
      componentPath: 'renia-magento-cart/components/ProductAddToCartPanel',
      priority: 20,
      props: {}
    });
  }
}
