// @env: mixed
import React from 'react';
import { useParams } from 'react-router-dom';
import { readEndpoint } from '../utils/config';
import { useProduct } from '../hooks/useProduct';
import { ProductDetails } from './components/ProductDetails';
import { ProductStatus } from './components/ProductStatus';

export const ProductPage: React.FC = () => {
  const params = useParams();
  const urlKey = params.urlKey ?? params['*'];
  const endpoint = React.useMemo(() => readEndpoint(), []);

  const { product, status } = useProduct({ urlKey });

  if (!endpoint) return <ProductStatus tone="muted" message="Brak endpointu Magento" />;
  if (!urlKey) return <ProductStatus tone="muted" message="Brak identyfikatora produktu" />;
  if (status === 'loading') return <ProductStatus tone="info" message="Ładowanie produktu..." />;
  if (status === 'error' || !product) return <ProductStatus tone="error" message="Nie udało się wczytać produktu." />;

  return <ProductDetails product={product} />;
};

export default ProductPage;
