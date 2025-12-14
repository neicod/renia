// @env: mixed
import { getLogger } from 'renia-logger';

const logger = getLogger();


export type {
  ConfigurableProduct,
  ConfigurableOption,
  ConfigurableOptionValue,
  ConfigurableVariant,
  VariantAttribute,
  SwatchData
} from './types';

export { isConfigurableProduct } from './types';

export { useConfigurableSelection } from './hooks/useConfigurableSelection';
export type { UseConfigurableSelectionResult } from './hooks/useConfigurableSelection';

export { mapConfigurableProduct } from './services/configurableMapper';
export { ConfigurableProductOptions } from './components/ConfigurableProductOptions';
export { ConfigurableAddToCartPanel } from './components/ConfigurableAddToCartPanel';
export { ConfigurableProductPrice } from './components/ConfigurableProductPrice';
export { OptionSelector } from './components/OptionSelector';
export { SwatchButton } from './components/SwatchButton';
export { DropdownSelector } from './components/DropdownSelector';
export { SelectedVariantSummary } from './components/SelectedVariantSummary';
export { ConfigurableProductListingWrapper } from './components/ConfigurableProductListingWrapper';


logger.info('magento-configurable-product/index.ts', 'Module index loaded');