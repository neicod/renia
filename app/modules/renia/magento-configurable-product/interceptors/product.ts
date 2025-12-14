// @env: server
export default function productInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    // Add configurable product add-to-cart panel with higher priority
    // than the default cart panel (which has priority 20)
    api.subslots.add({
      slot: 'product-view-actions',
      componentPath: 'renia-magento-configurable-product/components/ConfigurableAddToCartPanel',
      priority: 25,
      props: {}
    });
  }
}
