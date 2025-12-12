// @env: server
export default (api: any) => {
  if (api?.slots?.add) {
    api.slots.add({
      slot: 'control-menu',
      componentPath: 'renia-magento-cart/components/CartControlLink',
      priority: 90,
      id: 'cart-link'
    });
  }
};
