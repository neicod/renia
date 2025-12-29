// @env: mixed
import { WishlistPage } from '../pages/WishlistPage';

export default (api: any = {}) => {
  // api.registerComponents?.({
  //   'renia-magento-wishlist/pages/WishlistPage': WishlistPage
  // });

  api.layout.at('content').add('renia-magento-wishlist/pages/WishlistPage', 'wishlist-page', {
    sortOrder: { before: '-' }
  });
};
