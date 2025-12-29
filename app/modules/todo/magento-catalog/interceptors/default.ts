// @env: mixed
import { CategoryProductList } from '../components/CategoryProductList';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-catalog/components/CategoryProductList': CategoryProductList
  });
};
