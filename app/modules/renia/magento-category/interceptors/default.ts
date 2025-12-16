// @env: mixed
import { CategoryMainMenu } from '../components/CategoryMainMenu';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-category/components/CategoryMainMenu': CategoryMainMenu
  });

  if (api?.extension) {
    api.extension('header', {
      componentPath: 'renia-magento-category/components/CategoryMainMenu',
      priority: 50,
      id: 'category-main-menu'
    });
  }
};
