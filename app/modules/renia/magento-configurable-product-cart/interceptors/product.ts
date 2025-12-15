// @env: server
export default function productInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-view-actions', {
      componentPath: 'renia-magento-configurable-product-cart/components/ConfigurableAddToCartPanel',
      priority: 25,
      props: {}
    });
  }
}
