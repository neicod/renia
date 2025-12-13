// @env: mixed
import { registerComponent } from '@framework/registry/componentRegistry';
import { CategoryProductList } from './components/CategoryProductList';
import './services/storefrontConfigAugmenter';

registerComponent('renia-magento-catalog/components/CategoryProductList', CategoryProductList);

export default {};
