// @env: server
export default (api: any) => {
  if (api?.extension) {
    api.extension('control-menu', {
      componentPath: 'renia-magento-cart/components/CartControlLink',
      priority: 90,
      id: 'cart-link'
    });
  }
};
