// @env: server
export default function productInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-view-actions', {
      componentPath: 'renia-magento-cart/components/ProductAddToCartResolver',
      priority: 20,
      props: {
        slot: 'add-to-cart-product-page'
      }
    });
  }
}
