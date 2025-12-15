// @env: server
import { fetchProduct } from './services/product';
import { getLogger } from 'renia-logger';

const logger = getLogger();

export default async function handleProductRoute({ req }: { req: { path: string } }) {
  const urlKey = req.path.replace(/^\/+product\/?/, '').replace(/\/+$/, '');

  if (!urlKey) {
    return {};
  }

  try {
    const product = await fetchProduct({ urlKey });

    if (!product) {
      return { meta: { productUrlKey: urlKey } };
    }

    return {
      meta: {
        productUrlKey: urlKey,
        product
      }
    };
  } catch (error) {
    logger.error('[ProductRouteHandler] Failed to fetch product', {
      urlKey,
      error: error instanceof Error ? error.message : String(error)
    });
    return { meta: { productUrlKey: urlKey } };
  }
}
