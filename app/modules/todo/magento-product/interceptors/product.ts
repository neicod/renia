// @env: mixed
import { ProductPage } from '../pages/ProductPage.js';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-product/pages/ProductPage': ProductPage
  });

  api.layout.at('content').add('renia-magento-product/pages/ProductPage', 'product-page', {
    sortOrder: { before: '-' }
  });
};
