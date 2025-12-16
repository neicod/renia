// @env: server
import { WishlistPage } from '../pages/WishlistPage';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-wishlist/pages/WishlistPage': WishlistPage
  });

  if (api?.extension) {
    api.extension('content', {
      componentPath: 'renia-magento-wishlist/pages/WishlistPage',
      id: 'wishlist-page',
      priority: 20
    });
  }
};
