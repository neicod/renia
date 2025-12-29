// @env: mixed
import { ProductList } from '../components/ProductList.js';
import { ProductPage } from '../pages/ProductPage.js';
import { ProductTile } from '../components/ProductTile.js';
import { registerProductPageContextAugmenter } from '../services/pageContextAugmenter.js';
export default (api) => {
    if (typeof window === 'undefined') {
        registerProductPageContextAugmenter();
    }
    api.registerComponents?.({
        'renia-magento-product/pages/ProductPage': ProductPage,
        'renia-magento-product/components/ProductList': ProductList,
        'renia-magento-product/components/ProductTile': ProductTile
    });
};
