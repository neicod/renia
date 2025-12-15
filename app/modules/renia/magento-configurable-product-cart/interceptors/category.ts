// @env: server
export default function categoryInterceptor(api: any = {}) {
  if (api?.extension) {
    api.extension('product-listing-actions', {
      componentPath: 'renia-magento-configurable-product-cart/components/ConfigurableProductListingWrapper',
      category: 'configurable-product-actions',
      priority: 15,
      props: {}
    });
  }
}
