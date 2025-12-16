// @env: mixed
import { ProductList } from '../components/ProductList';
import { ProductPage } from '../pages/ProductPage';
import { ProductTile } from '../components/ProductTile';

export default (api: any) => {
  api.registerComponents?.({
    'magento-product/pages/ProductPage': ProductPage,
    'magento-product/components/ProductList': ProductList,
    'magento-product/components/ProductTile': ProductTile
  });
};
