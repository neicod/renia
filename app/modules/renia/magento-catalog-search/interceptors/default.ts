// @env: server
import { registerComponent } from '@framework/registry/componentRegistryServer';
import { SearchBar } from '../components/SearchBar';
import { SearchProductList } from '../components/SearchProductList';

export default (api: any = {}) => {
  registerComponent('renia-magento-catalog-search/components/SearchBar', SearchBar);
  registerComponent('renia-magento-catalog-search/components/SearchProductList', SearchProductList);

  if (api?.extension) {
    api.extension('control-menu', {
      componentPath: 'renia-magento-catalog-search/components/SearchBar',
      id: 'search-bar',
      priority: 100
    });

    api.extension('content', {
      componentPath: 'renia-magento-catalog-search/components/SearchProductList',
      id: 'search-product-list',
      priority: 20,
      meta: {
        onlyForRouteTypes: ['search']
      }
    });
  }
};
