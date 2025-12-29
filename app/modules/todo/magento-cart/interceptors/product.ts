// @env: mixed
import { ProductAddToCartPanel } from '../components/ProductAddToCartPanel';

export default function productInterceptor(api: any = {}) {
  // 1. Rejestruj strategie produktów dla SimpleProduct na stronie produktu
  api.registerProductTypeComponentStrategy?.({
    key: 'add-to-cart-button',
    components: {
      'SimpleProduct': ProductAddToCartPanel
    }
  });

  // 2. Rejestruj resolver jako extension dla host komponentu (PDP)
  api.extend
    ?.component('renia-magento-product/pages/components/ProductDetails')
    .outlet('actions')
    .add('renia-magento-cart/components/ProductAddToCartResolver', 'product-add-to-cart-resolver', {
      sortOrder: { before: '-' }
    });
}
