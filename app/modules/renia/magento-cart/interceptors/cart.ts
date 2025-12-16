// @env: server
import { CartPage } from '../pages/CartPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-cart/pages/CartPage': CartPage
  });

  if (api?.extension) {
    api.extension('content', {
      componentPath: 'renia-magento-cart/pages/CartPage',
      id: 'cart-page',
      priority: 20
    });
  }
};
