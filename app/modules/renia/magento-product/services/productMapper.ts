// @env: mixed
import type { Product } from '../types';

export const mapProduct = (item: any): Product => ({
  id: String(item?.id ?? item?.sku ?? Math.random()),
  sku: item?.sku ?? '',
  name: item?.name ?? '',
  urlKey: item?.url_key ?? undefined,
  urlPath: item?.url_path ?? undefined,
  thumbnail: item?.small_image?.url
    ? { url: item.small_image.url, label: item.small_image?.label }
    : undefined,
  price: item?.price_range?.minimum_price?.final_price
    ? {
        value: item.price_range.minimum_price.final_price.value,
        currency: item.price_range.minimum_price.final_price.currency
      }
    : undefined,
  priceOriginal: item?.price_range?.minimum_price?.regular_price
    ? {
        value: item.price_range.minimum_price.regular_price.value,
        currency: item.price_range.minimum_price.regular_price.currency
      }
    : undefined
});

export default mapProduct;
