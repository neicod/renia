// @env: mixed
import { registerComponent } from '@framework/registry/componentRegistry';
import { SearchProductList } from './components/SearchProductList';
import { SearchBar } from './components/SearchBar';

registerComponent('renia-magento-catalog-search/components/SearchProductList', SearchProductList);
registerComponent('renia-magento-catalog-search/components/SearchBar', SearchBar);

export default {};
