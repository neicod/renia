// @env: server
export default function categoryInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-listing-actions', {
      componentPath: 'renia-magento-cart/components/AddToCartButton',
      category: 'simple-product-actions',
      priority: 10,
      props: {}
    });
  }
}
