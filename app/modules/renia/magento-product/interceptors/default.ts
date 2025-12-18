// @env: mixed
import { ProductList } from '../components/ProductList';
import { ProductPage } from '../pages/ProductPage';
import { ProductTile } from '../components/ProductTile';
import { registerProductPageContextAugmenter } from '../services/pageContextAugmenter';

export default (api: any) => {
  if (typeof window === 'undefined') {
    registerProductPageContextAugmenter();
  }

  api.registerComponents?.({
    'renia-magento-product/pages/ProductPage': ProductPage,
    'renia-magento-product/components/ProductList': ProductList,
    'renia-magento-product/components/ProductTile': ProductTile
  });
};
