// @env: mixed
import { SearchBar } from '../components/SearchBar';
import { SearchProductList } from '../components/SearchProductList';

export default (api: any = {}) => {
  api.registerComponents?.({
    'renia-magento-catalog-search/components/SearchBar': SearchBar,
    'renia-magento-catalog-search/components/SearchProductList': SearchProductList
  });

  api.layout.get('control-menu').add('renia-magento-catalog-search/components/SearchBar', 'search-bar', {
    sortOrder: { before: '-' }
  });
};
