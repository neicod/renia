// @env: mixed
import React from 'react';
import { useWishlist } from '../hooks/useWishlist';
import { useIsClient } from '../hooks/useIsClient';
import { needsWishlistRefresh, refreshWishlistProducts } from '../services/wishlistSync';
import { useI18n } from 'renia-i18n/hooks/useI18n';

const formatPrice = (price?: { value: number; currency: string }) =>
  price ? `${price.value.toFixed(2)} ${price.currency}` : null;

export const WishlistPage: React.FC = () => {
  const { items, remove } = useWishlist();
  const isClient = useIsClient();
  const { t } = useI18n();
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'error'>('idle');

  const handleRefresh = React.useCallback(async () => {
    try {
      setStatus('loading');
      await refreshWishlistProducts();
      setStatus('idle');
    } catch (error) {
      console.error('[WishlistPage] Failed to refresh wishlist', error);
      setStatus('error');
    }
  }, []);

  React.useEffect(() => {
    if (isClient && needsWishlistRefresh()) {
      handleRefresh();
    }
  }, [isClient, handleRefresh]);

  if (!items.length) {
    return (
      <section className="card">
        <h1 style={{ marginTop: 0 }}>{t('wishlist.page.title')}</h1>
        <p style={{ color: '#64748b' }}>{t('wishlist.page.empty')}</p>
      </section>
    );
  }

  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t('wishlist.page.title')}</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>{t('wishlist.page.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={status === 'loading'}
          style={{
            padding: '0.45rem 0.9rem',
            borderRadius: '999px',
            border: '1px solid #cbd5f5',
            background: status === 'loading' ? '#e2e8f0' : '#fff',
            cursor: status === 'loading' ? 'not-allowed' : 'pointer'
          }}
        >
          {status === 'loading' ? t('wishlist.page.refreshing') : t('wishlist.page.refresh')}
        </button>
      </div>
      {status === 'error' ? (
        <p style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{t('wishlist.error.refresh')}</p>
      ) : null}
      <div className="product-grid" style={{ marginTop: '1.5rem' }}>
        {items.map((item) => (
          <article
            key={item.sku}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '1rem',
              display: 'grid',
              gap: '0.6rem'
            }}
          >
            <a
              href={item.urlKey ? `/product/${item.urlKey}` : '#'}
              style={{ aspectRatio: '4 / 5', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}
            >
              {item.thumbnail?.url ? (
                <img
                  src={item.thumbnail.url}
                  alt={item.thumbnail.label ?? item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%' }} />
              )}
            </a>
            <div style={{ display: 'grid', gap: '0.35rem' }}>
              <a
                href={item.urlKey ? `/product/${item.urlKey}` : '#'}
                style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}
              >
                {item.name}
              </a>
              <div style={{ color: '#1d4ed8', fontWeight: 600 }}>{formatPrice(item.price) ?? t('wishlist.price.pending')}</div>
            </div>
            <button
              type="button"
              onClick={() => remove(item.sku)}
              style={{
                justifySelf: 'start',
                padding: '0.35rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid #ef4444',
                color: '#ef4444',
                background: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {t('wishlist.action.remove')}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default WishlistPage;
