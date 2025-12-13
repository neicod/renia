// @env: mixed
import React from 'react';
import { useParams } from 'react-router-dom';
import { readEndpoint } from '../utils/config';
import { useProduct } from '../hooks/useProduct';
import { ProductDetails } from './components/ProductDetails';
import { ProductStatus } from './components/ProductStatus';
import { useI18n } from 'renia-i18n/hooks/useI18n';

export const ProductPage: React.FC = () => {
  const params = useParams();
  const urlKey = params.urlKey ?? params['*'];
  const endpoint = React.useMemo(() => readEndpoint(), []);
  const { t } = useI18n();
  const { product, status } = useProduct({ urlKey });

  if (!endpoint) return <ProductStatus tone="muted" message={t('product.error.noEndpoint')} />;
  if (!urlKey) return <ProductStatus tone="muted" message={t('product.error.noUrlKey')} />;
  if (status === 'loading') return <ProductStatus tone="info" message={t('product.loading')} />;
  if (status === 'error' || !product)
    return <ProductStatus tone="error" message={t('product.error.generic')} />;

  return <ProductDetails product={product} />;
};

export default ProductPage;
