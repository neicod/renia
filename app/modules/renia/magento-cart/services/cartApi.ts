// @env: mixed
import { QueryBuilder } from 'renia-graphql-client/builder';
import { executeGraphQLRequest } from '@framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

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

const buildCartSelection = (builder: QueryBuilder, path: string[]) => {
  builder.addField(path, 'id');
  builder.addField(path, 'total_quantity');
  const pricesPath = [...path, 'prices'];
  builder.addField(pricesPath, 'grand_total');
  builder.addField([...pricesPath, 'grand_total'], 'value');
  builder.addField([...pricesPath, 'grand_total'], 'currency');
  builder.addField(pricesPath, 'subtotal_excluding_tax');
  builder.addField([...pricesPath, 'subtotal_excluding_tax'], 'value');
  builder.addField([...pricesPath, 'subtotal_excluding_tax'], 'currency');

  const itemsPath = [...path, 'items'];
  builder.addField(itemsPath, 'id');
  builder.addField(itemsPath, 'uid');
  builder.addField(itemsPath, 'quantity');

  builder.addField(itemsPath, 'product');
  const productPath = [...itemsPath, 'product'];
  builder.addField(productPath, 'sku');
  builder.addField(productPath, 'name');
  builder.addField(productPath, 'small_image');
  builder.addField([...productPath, 'small_image'], 'url');

  builder.addField(itemsPath, 'prices');
  const itemPricesPath = [...itemsPath, 'prices'];
  builder.addField(itemPricesPath, 'price');
  builder.addField([...itemPricesPath, 'price'], 'value');
  builder.addField([...itemPricesPath, 'price'], 'currency');
  builder.addField(itemPricesPath, 'row_total');
  builder.addField([...itemPricesPath, 'row_total'], 'value');
  builder.addField([...itemPricesPath, 'row_total'], 'currency');
};

const buildAddProductsMutation = () => {
  const builder = new QueryBuilder('mutation').setName('AddProductsToCart');
  builder.setVariable('cartId', 'String!');
  builder.setVariable('items', '[CartItemInput!]!');
  builder.addField([], 'addProductsToCart', {
    args: {
      cartId: '$cartId',
      cartItems: '$items'
    }
  });
  buildCartSelection(builder, ['addProductsToCart', 'cart']);
  builder.addField(['addProductsToCart'], 'user_errors');
  builder.addField(['addProductsToCart', 'user_errors'], 'code');
  builder.addField(['addProductsToCart', 'user_errors'], 'message');
  return builder;
};

const buildCartQuery = () => {
  const builder = new QueryBuilder('query').setName('GetCart');
  builder.setVariable('cartId', 'String!');
  builder.addField([], 'cart', {
    args: {
      cart_id: '$cartId'
    }
  });
  buildCartSelection(builder, ['cart']);
  return builder;
};

const buildUpdateCartItemsMutation = () => {
  const builder = new QueryBuilder('mutation').setName('UpdateCartItems');
  builder.setVariable('input', 'UpdateCartItemsInput!');
  builder.addField([], 'updateCartItems', {
    args: {
      input: '$input'
    }
  });
  buildCartSelection(builder, ['updateCartItems', 'cart']);
  return builder;
};

const buildRemoveItemFromCartMutation = () => {
  const builder = new QueryBuilder('mutation').setName('RemoveItemFromCart');
  builder.setVariable('input', 'RemoveItemFromCartInput!');
  builder.addField([], 'removeItemFromCart', {
    args: {
      input: '$input'
    }
  });
  buildCartSelection(builder, ['removeItemFromCart', 'cart']);
  builder.addField(['removeItemFromCart'], 'user_errors');
  builder.addField(['removeItemFromCart', 'user_errors'], 'code');
  builder.addField(['removeItemFromCart', 'user_errors'], 'message');
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
  items: { sku: string; quantity: number }[]
): Promise<MagentoCart> => {
  const request = MagentoGraphQLRequestFactory.create({
    method: 'POST',
    payload: buildAddProductsMutation(),
    variables: {
      cartId,
      items: items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity
      }))
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
