// @env: mixed
import type { CartItem } from 'renia-module-cart';
import type { MagentoCart } from './cartApi';

const normalizePriceCents = (value?: number | null) =>
  Number.isFinite(value) ? Math.round(Number(value) * 100) : 0;

export const mapCartItems = (cart: MagentoCart): CartItem[] => {
  const items = cart.items ?? [];
  return items
    .filter((item): item is NonNullable<(typeof items)[number]> => Boolean(item))
    .map((item) => {
      const priceValue = item?.prices?.price?.value ?? item?.prices?.row_total?.value;
      return {
        id: String(item?.uid ?? item?.id ?? Math.random()),
        sku: item?.product?.sku ?? undefined,
        name: item?.product?.name ?? 'Produkt',
        qty: item?.quantity ?? 0,
        priceCents: normalizePriceCents(priceValue),
        currency: item?.prices?.price?.currency ?? item?.prices?.row_total?.currency ?? 'USD',
        payload: {
          remoteId: item?.id ?? null,
          uid: item?.uid ?? null
        }
      } satisfies CartItem;
    });
};

export const computeCartSummary = (cart: MagentoCart) => {
  const qty = cart.total_quantity ?? mapCartItems(cart).reduce((sum, item) => sum + item.qty, 0);
  const currency = cart.prices?.grand_total?.currency ?? cart.prices?.subtotal_excluding_tax?.currency;
  return {
    qty,
    currency: currency ?? 'USD'
  };
};
