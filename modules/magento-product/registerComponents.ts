// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { ProductList } from './components/ProductList';
import { ProductPage } from './pages/ProductPage';
import { ProductTile } from './components/ProductTile';

registerComponents({
  'magento-product/pages/ProductPage': ProductPage,
  'magento-product/components/ProductList': ProductList,
  'magento-product/components/ProductTile': ProductTile
});

export default {};
