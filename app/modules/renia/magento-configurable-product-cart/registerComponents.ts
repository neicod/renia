// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { ConfigurableAddToCartPanel } from './components/ConfigurableAddToCartPanel';
import { ConfigurableAddToCartIcon } from './components/ConfigurableAddToCartIcon';
import { ConfigurableProductListingWrapper } from './components/ConfigurableProductListingWrapper';

registerComponents({
  'renia-magento-configurable-product-cart/components/ConfigurableAddToCartPanel': ConfigurableAddToCartPanel,
  'renia-magento-configurable-product-cart/components/ConfigurableAddToCartIcon': ConfigurableAddToCartIcon,
  'renia-magento-configurable-product-cart/components/ConfigurableProductListingWrapper': ConfigurableProductListingWrapper
});
