// @env: mixed
import { WishlistControlLink } from '../components/WishlistControlLink';
import { WishlistHeart } from '../components/WishlistHeart';
import { WishlistPage } from '../pages/WishlistPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-wishlist/components/WishlistControlLink': WishlistControlLink,
    'renia-magento-wishlist/components/WishlistHeart': WishlistHeart,
    'renia-magento-wishlist/pages/WishlistPage': WishlistPage
  });

  if (api?.extension) {
    api.extension('control-menu', {
      componentPath: 'renia-magento-wishlist/components/WishlistControlLink',
      priority: 80,
      id: 'wishlist-link'
    });
  }
};
