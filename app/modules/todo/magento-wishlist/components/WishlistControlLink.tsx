// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useIsClient } from '../hooks/useIsClient';
import { useI18n } from 'renia-i18n/hooks/useI18n';

export const WishlistControlLink: React.FC = () => {
  const { items } = useWishlist();
  const isClient = useIsClient();
  const { t } = useI18n();
  const count = isClient ? items.length : undefined;
  return (
    <Link
      to="/wishlist"
      style={{
        textDecoration: 'none',
        color: '#0f172a',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem'
      }}
    >
      <span>{t('wishlist.link')}</span>
      {typeof count === 'number' && count > 0 ? (
        <span
          style={{
            minWidth: '1.5rem',
            height: '1.5rem',
            borderRadius: '999px',
            background: '#fcd34d',
            color: '#0f172a',
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 0.4rem'
          }}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
};

export default WishlistControlLink;
