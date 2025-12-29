// @env: mixed
import { customerStore } from './customerStore';
import { customerApi } from './customerApi';
import { getStoredCustomerToken, storeCustomerToken, clearCustomerToken } from './authStorage';
import { cartManager } from 'renia-magento-cart/services/cartManager';
import { cartIdStorage } from 'renia-magento-cart/services/cartIdStorage';

const getStoredCartId = () => cartIdStorage.read();
const storeCartId = (id: string) => cartIdStorage.write(id);
const clearStoredCartId = () => cartIdStorage.clear();

const handleCartAfterLogin = async () => {
  const guestCartId = getStoredCartId();
  const customerCartId = await customerApi.fetchCustomerCartId();
  let finalCartId = customerCartId ?? guestCartId ?? null;

  if (guestCartId && customerCartId && guestCartId !== customerCartId) {
    finalCartId = await customerApi.mergeCarts(guestCartId, customerCartId);
  }

  if (finalCartId) {
    storeCartId(finalCartId);
  } else {
    clearStoredCartId();
  }

  await cartManager.refreshCart();
};

const fetchAndStoreCustomer = async (token: string) => {
  customerStore.setLoading(token);
  try {
    const customer = await customerApi.fetchCustomer();
    if (customer?.email) {
      customerStore.setAuthenticated(customer, token);
    } else {
      customerStore.setAnonymous();
    }
  } catch (error) {
    console.error('[customerManager] fetch customer failed', error);
    customerStore.setAnonymous();
    clearCustomerToken();
  }
};

export const customerManager = {
  async login(email: string, password: string) {
    customerStore.setLoading(null);
    try {
      const token = await customerApi.generateToken(email, password);
      storeCustomerToken(token);
      await fetchAndStoreCustomer(token);
      await handleCartAfterLogin();
      return customerStore.getState().customer;
    } catch (error) {
      customerStore.setError(error instanceof Error ? error.message : 'Nie udało się zalogować.');
      throw error;
    }
  },

  async register(input: { customer: Record<string, unknown>; password: string }) {
    customerStore.setLoading(null);
    try {
      type RegistrationPayload = Record<string, unknown> & {
        password: string;
        email?: unknown;
        customer?: { email?: unknown };
      };
      const payload: RegistrationPayload = {
        ...(input.customer ?? {}),
        password: input.password
      };
      await customerApi.createCustomer(payload);
      const email =
        typeof payload.email === 'string'
          ? payload.email
          : typeof (payload as any)?.customer?.email === 'string'
            ? (payload as any).customer.email
            : null;
      if (email) {
        await customerManager.login(email, input.password);
      } else {
        customerStore.setAnonymous();
      }
    } catch (error) {
      customerStore.setError(
        error instanceof Error ? error.message : 'Nie udało się utworzyć konta.'
      );
      throw error;
    }
  },

  async bootstrap() {
    const token = getStoredCustomerToken();
    if (!token) return;
    await fetchAndStoreCustomer(token);
    if (customerStore.getState().status === 'authenticated') {
      await cartManager.refreshCart();
    }
  },

  logout() {
    clearCustomerToken();
    customerStore.setAnonymous();
    cartManager.clear();
  }
};

export default customerManager;
