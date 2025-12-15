// @env: mixed
import { registerComponents } from '@framework/registry/componentRegistry';

// Load augmenter and mapper
import './services/configurableQueryAugmenter';
import './services/configurableMapper';

import { ConfigurableProductOptions } from './components/ConfigurableProductOptions';
import { ConfigurableProductPrice } from './components/ConfigurableProductPrice';
import { OptionSelector } from './components/OptionSelector';
import { SwatchButton } from './components/SwatchButton';
import { DropdownSelector } from './components/DropdownSelector';
import { SelectedVariantSummary } from './components/SelectedVariantSummary';

registerComponents({
  'renia-magento-configurable-product/components/ConfigurableProductOptions': ConfigurableProductOptions,
  'renia-magento-configurable-product/components/ConfigurableProductPrice': ConfigurableProductPrice,
  'renia-magento-configurable-product/components/OptionSelector': OptionSelector,
  'renia-magento-configurable-product/components/SwatchButton': SwatchButton,
  'renia-magento-configurable-product/components/DropdownSelector': DropdownSelector,
  'renia-magento-configurable-product/components/SelectedVariantSummary': SelectedVariantSummary
});

export default {};
