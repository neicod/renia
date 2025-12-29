// @env: mixed
import { CategoryPage } from '../pages/CategoryPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-category/pages/CategoryPage': CategoryPage
  });

  api.layout.at('content').add('renia-magento-category/pages/CategoryPage', 'category-page', {
    sortOrder: { before: '-' }
  });
};

