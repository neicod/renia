// @env: mixed
import { CategoryProductList } from '../components/CategoryProductList';
import { ProductListingToolbar } from '../components/ProductListingToolbar';
import { ProductListingPagination } from '../components/ProductListingPagination';
import '../services/storefrontConfigAugmenter';

export default (api: any) => {
  api.registerComponents?.({
    'renia-magento-catalog/components/CategoryProductList': CategoryProductList,
    'renia-magento-catalog/components/ProductListingToolbar': ProductListingToolbar,
    'renia-magento-catalog/components/ProductListingPagination': ProductListingPagination
  });
};
