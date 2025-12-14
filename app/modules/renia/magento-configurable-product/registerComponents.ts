// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';
import { getLogger } from 'renia-logger';

// Load augmenter and mapper
import './services/configurableQueryAugmenter';
import './services/configurableMapper';

const logger = getLogger();
logger.info('registerComponents', 'magento-configurable-product: Components registered');

import { ConfigurableProductOptions } from './components/ConfigurableProductOptions';
import { ConfigurableAddToCartPanel } from './components/ConfigurableAddToCartPanel';
import { ConfigurableProductPrice } from './components/ConfigurableProductPrice';
import { OptionSelector } from './components/OptionSelector';
import { SwatchButton } from './components/SwatchButton';
import { DropdownSelector } from './components/DropdownSelector';
import { SelectedVariantSummary } from './components/SelectedVariantSummary';
import { ConfigurableProductListingWrapper } from './components/ConfigurableProductListingWrapper';

registerComponents({
  'renia-magento-configurable-product/components/ConfigurableProductOptions': ConfigurableProductOptions,
  'renia-magento-configurable-product/components/ConfigurableAddToCartPanel': ConfigurableAddToCartPanel,
  'renia-magento-configurable-product/components/ConfigurableProductPrice': ConfigurableProductPrice,
  'renia-magento-configurable-product/components/OptionSelector': OptionSelector,
  'renia-magento-configurable-product/components/SwatchButton': SwatchButton,
  'renia-magento-configurable-product/components/DropdownSelector': DropdownSelector,
  'renia-magento-configurable-product/components/SelectedVariantSummary': SelectedVariantSummary,
  'renia-magento-configurable-product/components/ConfigurableProductListingWrapper': ConfigurableProductListingWrapper
});

export default {};
