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

  api.layout.get('control-menu').add('renia-magento-wishlist/components/WishlistControlLink', 'wishlist-link', {
    sortOrder: { before: '-' }
  });
};
