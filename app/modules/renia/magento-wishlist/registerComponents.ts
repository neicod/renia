// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { WishlistControlLink } from './components/WishlistControlLink';
import { WishlistHeart } from './components/WishlistHeart';
import { WishlistPage } from './pages/WishlistPage';

registerComponents({
  'renia-magento-wishlist/components/WishlistControlLink': WishlistControlLink,
  'renia-magento-wishlist/components/WishlistHeart': WishlistHeart,
  'renia-magento-wishlist/pages/WishlistPage': WishlistPage
});

export default {};
