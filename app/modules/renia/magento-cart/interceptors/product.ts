// @env: mixed
import { ProductAddToCartPanel } from '../components/ProductAddToCartPanel';

export default function productInterceptor(api: any = {}) {
  // 1. Rejestruj strategie produktów dla SimpleProduct na stronie produktu
  api.registerProductTypeComponentStrategy?.({
    slot: 'add-to-cart-button',
    components: {
      'SimpleProduct': ProductAddToCartPanel
    }
  });

  // 2. Rejestruj resolver w slocie
  api.layout.get('product-view-actions').add('renia-magento-cart/components/ProductAddToCartResolver', 'product-add-to-cart-resolver', {
    sortOrder: { before: '-' }
  });
}
