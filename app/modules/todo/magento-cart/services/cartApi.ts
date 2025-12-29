// @env: mixed
import { gql } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

/**
 * Base interface for cart items
 * Modules can extend this interface to add custom fields (e.g., selected_options for configurable products)
 */
export interface CartItemInput {
  sku: string;
  quantity: number;
}

type MagentoMoney = {
  value?: number | null;
  currency?: string | null;
};

type MagentoCartItem = {
  id?: string | number | null;
  uid?: string | null;
  quantity?: number | null;
  product?: {
    sku?: string | null;
    name?: string | null;
    small_image?: {
      url?: string | null;
    } | null;
  } | null;
  prices?: {
    price?: MagentoMoney | null;
    row_total?: MagentoMoney | null;
  } | null;
};

export type MagentoCart = {
  id?: string | null;
  total_quantity?: number | null;
  items?: MagentoCartItem[] | null;
  prices?: {
    grand_total?: MagentoMoney | null;
    subtotal_excluding_tax?: MagentoMoney | null;
  } | null;
};

type AddProductsResult = {
  addProductsToCart?: {
    cart?: MagentoCart | null;
    user_errors?: { code?: string | null; message?: string | null }[] | null;
  } | null;
};

type CartResponse = {
  cart?: MagentoCart | null;
};

type UpdateCartItemsResult = {
  updateCartItems?: {
    cart?: MagentoCart | null;
    user_errors?: { code?: string | null; message?: string | null }[] | null;
  } | null;
};

type RemoveItemResult = {
  removeItemFromCart?: {
    cart?: MagentoCart | null;
    user_errors?: { code?: string | null; message?: string | null }[] | null;
  } | null;
};

type CartErrorMeta = {
  type: 'graphql' | 'user' | 'state';
  errors?: unknown;
  userErrors?: { code?: string | null; message?: string | null }[] | null;
};

const createCartError = (message: string, meta: CartErrorMeta) => {
  const error = new Error(message);
  (error as any).cartError = meta;
  return error;
};

const CART_SELECTION = gql`
  id
  total_quantity
  prices {
    grand_total { value currency }
    subtotal_excluding_tax { value currency }
  }
  items {
    id
    uid
    quantity
    product {
      sku
      name
      small_image { url }
    }
    prices {
      price { value currency }
      row_total { value currency }
    }
  }
`;

const buildAddProductsMutation = () => {
  const builder = new QueryBuilder('mutation').setName('AddProductsToCart');
  builder.setVariable('cartId', 'String!');
  builder.setVariable('items', '[CartItemInput!]!');
  builder.add(gql`
    addProductsToCart(cartId: $cartId, cartItems: $items) {
      cart { ${CART_SELECTION} }
      user_errors { code message }
    }
  `);
  return builder;
};

const buildCartQuery = () => {
  const builder = new QueryBuilder('query').setName('GetCart');
  builder.setVariable('cartId', 'String!');
  builder.add(gql`
    cart(cart_id: $cartId) {
      ${CART_SELECTION}
    }
  `);
  return builder;
};

const buildUpdateCartItemsMutation = () => {
  const builder = new QueryBuilder('mutation').setName('UpdateCartItems');
  builder.setVariable('input', 'UpdateCartItemsInput!');
  builder.add(gql`
    updateCartItems(input: $input) {
      cart { ${CART_SELECTION} }
    }
  `);
  return builder;
};

const buildRemoveItemFromCartMutation = () => {
  const builder = new QueryBuilder('mutation').setName('RemoveItemFromCart');
  builder.setVariable('input', 'RemoveItemFromCartInput!');
  builder.add(gql`
    removeItemFromCart(input: $input) {
      cart { ${CART_SELECTION} }
      user_errors { code message }
    }
  `);
  return builder;
};

const CREATE_CART_MUTATION = 'mutation CreateEmptyCart { createEmptyCart }';

export const createEmptyCart = async (): Promise<string> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: CREATE_CART_MUTATION,
    operationId: 'magentoCart.createEmptyCart'
  });
  const response = await executeGraphQLRequest(request);
  if (response.errors) {
    throw createCartError('GraphQL errors podczas tworzenia koszyka.', {
      type: 'graphql',
      errors: response.errors
    });
  }
  const id = (response.data as any)?.createEmptyCart;
  if (!id || typeof id !== 'string') {
    throw new Error('Nie udało się utworzyć koszyka.');
  }
  return id;
};

export const addProductsToCart = async (
  cartId: string,
  items: CartItemInput[]
): Promise<MagentoCart> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildAddProductsMutation(),
    variables: {
      cartId,
      items  // Pass items directly - modules can extend CartItemInput with custom fields
    },
    operationId: 'magentoCart.addProducts'
  });
  const response = await executeGraphQLRequest(request);
  if (response.errors) {
    throw createCartError('GraphQL errors podczas dodawania do koszyka.', {
      type: 'graphql',
      errors: response.errors
    });
  }
  const payload = (response.data as AddProductsResult) ?? {};
  const userErrors = payload.addProductsToCart?.user_errors ?? [];
  if (userErrors.length) {
    const message = userErrors.map((err) => err?.message).filter(Boolean).join(', ');
    throw createCartError(message || 'Nie udało się dodać produktu do koszyka.', {
      type: 'user',
      userErrors
    });
  }
  const cart = payload.addProductsToCart?.cart;
  if (!cart) {
    throw new Error('Brak danych koszyka w odpowiedzi.');
  }
  return cart;
};

export const fetchCart = async (cartId: string): Promise<MagentoCart> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildCartQuery(),
    variables: { cartId },
    operationId: 'magentoCart.getCart'
  });
  const response = await executeGraphQLRequest(request);
  if (response.errors) {
    throw createCartError('GraphQL errors podczas pobierania koszyka.', {
      type: 'graphql',
      errors: response.errors
    });
  }
  const data = (response.data as CartResponse) ?? {};
  if (!data.cart) {
    throw createCartError('Koszyk jest pusty albo nie istnieje.', {
      type: 'state'
    });
  }
  return data.cart;
};

export const updateCartItems = async (
  cartId: string,
  items: { cartItemId: number; quantity: number }[]
): Promise<MagentoCart> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildUpdateCartItemsMutation(),
    variables: {
      input: {
        cart_id: cartId,
        cart_items: items.map((item) => ({
          cart_item_id: item.cartItemId,
          quantity: item.quantity
        }))
      }
    },
    operationId: 'magentoCart.updateItems'
  });
  const response = await executeGraphQLRequest(request);
  if (response.errors) {
    throw createCartError('GraphQL errors podczas aktualizacji koszyka.', {
      type: 'graphql',
      errors: response.errors
    });
  }
  const payload = (response.data as UpdateCartItemsResult) ?? {};
  const userErrors = payload.updateCartItems?.user_errors ?? [];
  if (userErrors.length) {
    const message = userErrors.map((err) => err?.message).filter(Boolean).join(', ');
    throw createCartError(message || 'Nie udało się zaktualizować koszyka.', {
      type: 'user',
      userErrors
    });
  }
  const cart = payload.updateCartItems?.cart;
  if (!cart) {
    throw new Error('Brak danych koszyka po aktualizacji.');
  }
  return cart;
};

export const removeItemFromCart = async (
  cartId: string,
  cartItemId: number
): Promise<MagentoCart> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildRemoveItemFromCartMutation(),
    variables: {
      input: {
        cart_id: cartId,
        cart_item_id: cartItemId
      }
    },
    operationId: 'magentoCart.removeItem'
  });
  const response = await executeGraphQLRequest(request);
  if (response.errors) {
    throw createCartError('GraphQL errors podczas usuwania pozycji.', {
      type: 'graphql',
      errors: response.errors
    });
  }
  const payload = (response.data as RemoveItemResult) ?? {};
  const userErrors = payload.removeItemFromCart?.user_errors ?? [];
  if (userErrors.length) {
    const message = userErrors.map((err) => err?.message).filter(Boolean).join(', ');
    throw createCartError(message || 'Nie udało się usunąć pozycji z koszyka.', {
      type: 'user',
      userErrors
    });
  }
  const cart = payload.removeItemFromCart?.cart;
  if (!cart) {
    throw createCartError('Brak danych koszyka po usunięciu pozycji.', { type: 'state' });
  }
  return cart;
};
