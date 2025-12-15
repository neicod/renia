// @env: server
import { getLogger } from 'renia-logger';

const logger = getLogger();

export default function categoryInterceptor(api: any = {}) {
  if (api?.extension) {
    logger.info('categoryInterceptor', 'Registering ConfigurableProductListingWrapper to product-listing-actions');

    api.extension('product-listing-actions', {
      componentPath: 'renia-magento-configurable-product-cart/components/ConfigurableProductListingWrapper',
      category: 'configurable-product-actions',
      priority: 15,
      props: {}
    });
  } else {
    logger.warn('categoryInterceptor', 'api.extension is not available');
  }
}
