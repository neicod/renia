// @env: mixed
import React from 'react';
import type { Product } from 'magento-product/types';
import { useWishlist } from '../hooks/useWishlist';
import { useIsClient } from '../hooks/useIsClient';
import { useToast } from 'renia-ui-toast/hooks/useToast';
import { useI18n } from 'renia-i18n/hooks/useI18n';

type Props = {
  product: Product;
  variant?: 'listing' | 'pdp';
};

const heartStyles = {
  base: {
    padding: '0.35rem',
    borderRadius: '999px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 120ms ease',
    width: '2.25rem',
    height: '2.25rem'
  },
  pdp: {
    width: '2.75rem',
    height: '2.75rem'
  }
} as const;

const HeartIcon: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21s-6-4.35-8.57-7.56C1.45 11 1 8.45 2.4 6.64 4.54 3.92 8.4 4.5 10 7c1.6-2.5 5.46-3.08 7.6-.36 1.4 1.81.95 4.36-1.03 6.8C18 15 12 21 12 21Z"
      stroke={filled ? 'none' : '#1e3a8a'}
      strokeWidth="1.6"
      fill={filled ? '#ef4444' : 'transparent'}
    />
  </svg>
);

export const WishlistHeart: React.FC<Props> = ({ product, variant = 'listing' }) => {
  const { has, toggle } = useWishlist();
  const isClient = useIsClient();
  const toast = useToast();
  const { t } = useI18n();
  const [busy, setBusy] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Track hydration to avoid SSR/CSR mismatches
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!product?.sku) return null;

  // SSR: render with active=false (empty heart)
  // CSR after hydration: render with actual state from has(product.sku)
  const active = isHydrated ? has(product.sku) : false;

  const handleClick = async () => {
    if (busy || !isHydrated) return;
    setBusy(true);
    try {
      const result = toggle(product);
      toast({
        tone: 'info',
        title: result.added ? t('wishlist.toast.added') : t('wishlist.toast.removed'),
        description: product.name
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active ? t('wishlist.heart.label.remove') : t('wishlist.heart.label.add')
      }
      onClick={handleClick}
      disabled={!isHydrated || busy}
      style={{
        ...heartStyles.base,
        ...(variant === 'pdp' ? heartStyles.pdp : null),
        borderColor: active ? '#ef4444' : '#d1d5db',
        background: active ? 'rgba(239,68,68,0.15)' : '#fff'
      }}
    >
      <HeartIcon filled={active} />
    </button>
  );
};

export default WishlistHeart;
