// @env: server
import { registerComponent } from '@framework/registry/componentRegistryServer';
import { CategoryProductList } from '../components/CategoryProductList';


export default (api: any) => {
  registerComponent('renia-magento-catalog/components/CategoryProductList', CategoryProductList);

  if (api?.slots?.add) {
    api.slots.add({
      slot: 'content',
      componentPath: 'renia-magento-catalog/components/CategoryProductList',
      id: 'category-product-list',
      priority: 20,
      props: {},
      meta: {
        requiresCategoryPath: true,
        onlyForRouteTypes: ['category']
      }
    });
  }
};
