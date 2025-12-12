// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { WishlistControlLink } from './components/WishlistControlLink';
import { WishlistPage } from './pages/WishlistPage';

registerComponents({
  'magento-wishlist/components/WishlistControlLink': WishlistControlLink,
  'magento-wishlist/pages/WishlistPage': WishlistPage
});

export default {};
