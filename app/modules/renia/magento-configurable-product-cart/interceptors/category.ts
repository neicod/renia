// @env: server
import { getLogger } from 'renia-logger';

const logger = getLogger();

export default function categoryInterceptor(api: any = {}) {
  if (api?.subslots?.add) {
    logger.info('categoryInterceptor', 'Registering ConfigurableProductListingWrapper to product-listing-actions');

    // Add configurable product listing wrapper in separate category
    // System automatically chooses the category with highest priority
    api.subslots.add({
      slot: 'product-listing-actions',
      componentPath: 'renia-magento-configurable-product-cart/components/ConfigurableProductListingWrapper',
      category: 'configurable-product-actions',
      priority: 15,
      props: {}
    });
  } else {
    logger.warn('categoryInterceptor', 'api.subslots.add is not available');
  }
}
