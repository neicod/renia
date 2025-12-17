// @env: mixed
import type {
  ConfigurableProduct,
  ConfigurableOption,
  ConfigurableOptionValue,
  ConfigurableVariant,
  VariantAttribute,
  SwatchData
} from '../types';
import type { ProductMedia, ProductPrice, ProductMapperInterface } from 'magento-product/types';
import { registerProductMapper } from 'magento-product/services/productMapper';
import { mapCommonProductFields } from 'magento-product/services/productMapperShared';

const configurableProductMapper: ProductMapperInterface = {
  map(item: any): ConfigurableProduct {
    return {
      ...mapCommonProductFields(item),
      __typename: 'ConfigurableProduct',
      configurableOptions: mapConfigurableOptions(item.configurable_options ?? []),
      variants: mapVariants(item.variants ?? [])
    };
  }
};

const mapConfigurableOptions = (options: any[]): ConfigurableOption[] => {
  return options.map(opt => ({
    attributeId: String(opt.attribute_id ?? ''),
    attributeCode: opt.attribute_code ?? '',
    label: opt.label ?? '',
    position: Number(opt.position ?? 0),
    values: mapOptionValues(opt.values ?? [])
  }));
};

const mapOptionValues = (values: any[]): ConfigurableOptionValue[] => {
  return values.map(val => ({
    valueIndex: Number(val.value_index ?? 0),
    label: val.label ?? '',
    swatchData: val.swatch_data ? mapSwatchData(val.swatch_data) : undefined,
    useDefaultValue: val.use_default_value ?? false
  }));
};

const mapSwatchData = (data: any): SwatchData => ({
  type: (data.type ?? 'TEXT') as 'COLOR' | 'IMAGE' | 'TEXT',
  value: data.value ?? ''
});

const mapVariants = (variants: any[]): ConfigurableVariant[] => {
  return variants.map(variant => ({
    product: {
      id: String(variant.product?.id ?? ''),
      sku: variant.product?.sku ?? '',
      name: variant.product?.name ?? '',
      thumbnail: mapVariantMedia(variant.product?.small_image),
      price: mapVariantPrice(variant.product?.price_range),
      stockStatus: variant.product?.stock_status as 'IN_STOCK' | 'OUT_OF_STOCK' | undefined
    },
    attributes: mapVariantAttributes(variant.attributes ?? [])
  }));
};

const mapVariantMedia = (media: any): ProductMedia | undefined => {
  if (!media?.url) return undefined;
  return {
    url: media.url,
    label: media.label
  };
};

const mapVariantPrice = (priceRange: any): ProductPrice | undefined => {
  if (!priceRange?.minimum_price?.final_price) return undefined;
  return {
    value: priceRange.minimum_price.final_price.value,
    currency: priceRange.minimum_price.final_price.currency
  };
};

const mapVariantAttributes = (attributes: any[]): VariantAttribute[] => {
  return attributes.map(attr => ({
    code: attr.code ?? '',
    valueIndex: Number(attr.value_index ?? 0),
    label: attr.label ?? ''
  }));
};

// Register ConfigurableProduct mapper in the registry
registerProductMapper('ConfigurableProduct', configurableProductMapper);

export const mapConfigurableProduct = (item: any) => configurableProductMapper.map(item);
export default { mapConfigurableProduct };
