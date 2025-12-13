// @env: server
import { CategoryMainMenu } from '../components/CategoryMainMenu';
import { registerComponent } from '@framework/registry/componentRegistry';

export default (api: any) => {
  registerComponent('renia-magento-category/components/CategoryMainMenu', CategoryMainMenu);

  if (api?.slots?.add) {
    api.slots.add({
      slot: 'header',
      componentPath: 'renia-magento-category/components/CategoryMainMenu',
      priority: 50,
      id: 'category-main-menu'
    });
  }
};
