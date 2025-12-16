// @env: mixed
import { CategoryHeader } from '../components/CategoryHeader';
import { CategoryMainMenu } from '../components/CategoryMainMenu';
import { CategoryPage } from '../pages/CategoryPage';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-category/components/CategoryHeader': CategoryHeader,
    'renia-magento-category/components/CategoryMainMenu': CategoryMainMenu,
    'renia-magento-category/pages/CategoryPage': CategoryPage
  });

  // Inject CategoryMainMenu into header slot
  api.layout
    .get('header')
    .add(
      'renia-magento-category/components/CategoryMainMenu',
      'category-main-menu',
      { sortOrder: { before: '-' } }
    );
};
