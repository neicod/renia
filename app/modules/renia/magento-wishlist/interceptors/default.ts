// @env: server
export default (api: any) => {
  if (api?.slots?.add) {
    api.slots.add({
      slot: 'control-menu',
      componentPath: 'renia-magento-wishlist/components/WishlistControlLink',
      priority: 80,
      id: 'wishlist-link'
    });
  }
};
