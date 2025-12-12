// @env: mixed
export type ProductPrice = {
  value: number;
  currency: string;
};

export type ProductMedia = {
  url: string;
  label?: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  urlKey?: string;
  urlPath?: string;
  thumbnail?: ProductMedia;
  price?: ProductPrice;
  priceOriginal?: ProductPrice;
};

export type ProductSortOption = {
  value: string;
  label: string;
};
