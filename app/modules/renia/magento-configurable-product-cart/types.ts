// @env: mixed
import type { CartItemInput } from 'renia-magento-cart/services/cartApi';

/**
 * Cart item for configurable products
 * Extends CartItemInput interface with additional configurable-specific fields
 */
export type ConfigurableCartItemInput = CartItemInput & {
  selected_options: string[];     // Base64-encoded configurable options (e.g., ["Y29uZmlndXJhYmxlLzEyLzEz", "..."])
};
