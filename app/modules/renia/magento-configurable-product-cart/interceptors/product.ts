// @env: mixed
import { ConfigurableAddToCartPanel } from '../components/ConfigurableAddToCartPanel';

export default function productInterceptor(api: any = {}) {
  // Rejestruj strategie produktów dla ConfigurableProduct na stronie produktu
  api.registerProductTypeComponentStrategy?.({
    slot: 'add-to-cart-button',
    components: {
      'ConfigurableProduct': ConfigurableAddToCartPanel
    }
  });
}
