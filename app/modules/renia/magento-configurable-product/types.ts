// @env: mixed
import type { ProductInterface, ProductMedia, ProductPrice } from 'magento-product/types';

export type SwatchData = {
  type: 'COLOR' | 'IMAGE' | 'TEXT';
  value: string;
};

export type ConfigurableOptionValue = {
  valueIndex: number;
  label: string;
  swatchData?: SwatchData;
  useDefaultValue?: boolean;
};

export type ConfigurableOption = {
  attributeId: string;
  attributeCode: string;
  label: string;
  position: number;
  values: ConfigurableOptionValue[];
};

export type VariantAttribute = {
  code: string;
  valueIndex: number;
  label: string;
};

export type ConfigurableVariant = {
  product: {
    id: string;
    sku: string;
    name: string;
    thumbnail?: ProductMedia;
    price?: ProductPrice;
    stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
  };
  attributes: VariantAttribute[];
};

export type ConfigurableProduct = ProductInterface & {
  __typename: 'ConfigurableProduct';
  configurableOptions: ConfigurableOption[];
  variants: ConfigurableVariant[];
};

export const isConfigurableProduct = (product: ProductInterface): product is ConfigurableProduct => {
  // Check if product has configurable product fields
  return (
    product.__typename === 'ConfigurableProduct' ||
    (Array.isArray(product.configurableOptions) && Array.isArray(product.variants))
  );
};
