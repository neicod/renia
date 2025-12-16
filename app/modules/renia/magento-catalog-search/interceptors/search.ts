// @env: mixed
import { SearchProductList } from '../components/SearchProductList';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-catalog-search/components/SearchProductList': SearchProductList
  });

  if (api?.extension) {
    api.extension('content', {
      componentPath: 'renia-magento-catalog-search/components/SearchProductList',
      id: 'search-product-list',
      priority: 20
    });
  }
};
