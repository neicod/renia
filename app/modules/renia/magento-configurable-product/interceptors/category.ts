// @env: server
import { getLogger } from 'renia-logger';

const logger = getLogger();

export default function categoryInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    logger.info('categoryInterceptor', 'Registering ConfigurableProductListingWrapper to product-listing-actions');
    // Add configurable product listing wrapper with higher priority (15)
    // than default AddToCartButton from magento-cart (priority 10)
    // For non-configurable products, wrapper returns null and magento-cart button is shown instead
    api.subslots.add({
      slot: 'product-listing-actions',
      componentPath: 'renia-magento-configurable-product/components/ConfigurableProductListingWrapper',
      priority: 15,
      props: {}
    });
  } else {
    logger.warn('categoryInterceptor', 'api.subslots.add is not available');
  }
}

