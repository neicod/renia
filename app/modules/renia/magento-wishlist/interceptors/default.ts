// @env: server
export default (api: any) => {
  if (api?.extension) {
    api.extension('control-menu', {
      componentPath: 'renia-magento-wishlist/components/WishlistControlLink',
      priority: 80,
      id: 'wishlist-link'
    });
  }
};
