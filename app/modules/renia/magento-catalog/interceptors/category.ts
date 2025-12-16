// @env: mixed
import { CategoryProductList } from '../components/CategoryProductList';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-catalog/components/CategoryProductList': CategoryProductList
  });

  if (api?.extension) {
    api.extension('content', {
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
