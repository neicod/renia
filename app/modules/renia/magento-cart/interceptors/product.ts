// @env: server
export default function productInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-view-actions', {
      componentPath: 'renia-magento-cart/components/ProductAddToCartPanel',
      priority: 20,
      props: {}
    });
  }
}
