// @env: server
import { CartPage } from '../pages/CartPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-cart/pages/CartPage': CartPage
  });

  api.layout.get('content').add('renia-magento-cart/pages/CartPage', 'cart-page', {
    sortOrder: { before: '-' }
  });
};
