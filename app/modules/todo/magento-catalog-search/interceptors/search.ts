// @env: mixed
import { SearchProductList } from '../components/SearchProductList';

export default (api: any = {}) => {
  api.layout.at('content').add('renia-magento-catalog-search/components/SearchProductList', 'search-product-list', {
    sortOrder: { before: '-' }
  });
};
