// @env: mixed
import { CategoryProductList } from '../components/CategoryProductList';
import '../services/storefrontConfigAugmenter';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-catalog/components/CategoryProductList': CategoryProductList
  });
};
