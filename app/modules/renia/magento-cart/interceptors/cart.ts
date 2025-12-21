// @env: mixed
import { CartPage } from '../pages/CartPage';

export default (api: any) => {
  api.layout.get('content').add('renia-magento-cart/pages/CartPage', 'cart-page', {
    sortOrder: { before: '-' }
  });
};
