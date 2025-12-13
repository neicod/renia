// @env: mixed
import { registerCartErrorHandler } from 'renia-magento-cart/services/cartManager';
import { customerStore } from './customerStore';
import { customerApi } from './customerApi';
import { storeCartId, clearStoredCartId } from 'renia-magento-cart/services/cartStorage';
import { cartManager } from 'renia-magento-cart/services/cartManager';

const PATTERNS = ['isn\'t active', 'is no longer active', 'no such entity', 'cart doesn\'t exist'];

const normalizeText = (value: unknown) =>
  typeof value === 'string' ? value.toLowerCase() : JSON.stringify(value ?? '').toLowerCase();

const extractCartErrorMeta = (error: unknown) => (error as any)?.cartError;

const containsInactivePattern = (value: unknown) => {
  const normalized = normalizeText(value);
  return PATTERNS.some((pattern) => normalized.includes(pattern));
};

const isRecoverableCustomerCartError = (error: unknown) => {
  if (!error) return false;
  const meta = extractCartErrorMeta(error);
  if (meta?.type === 'state') return true;
  if (meta?.errors && containsInactivePattern(meta.errors)) {
    return true;
  }
  if (meta?.userErrors && meta.userErrors.some((err: any) => containsInactivePattern(err?.message))) {
    return true;
  }
  const message = (error as Error)?.message;
  return containsInactivePattern(message);
};

let isRecovering = false;

const recoverCustomerCart = async () => {
  if (isRecovering) return;
  isRecovering = true;
  try {
    const cartId = await customerApi.fetchCustomerCartId();
    if (cartId) {
      storeCartId(cartId);
      await cartManager.refreshCart();
    } else {
      clearStoredCartId();
      cartManager.clear();
    }
  } catch (recoveryError) {
    console.error('[customerCartRecovery] Failed to recover cart', recoveryError);
  } finally {
    isRecovering = false;
  }
};

registerCartErrorHandler(async ({ error }) => {
  const customerState = customerStore.getState();
  if (customerState.status !== 'authenticated') {
    return;
  }
  if (!isRecoverableCustomerCartError(error)) {
    return;
  }
  await recoverCustomerCart();
});
