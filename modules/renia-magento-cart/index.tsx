import React from 'react';

export type CartItem = {
  id: string;
  name: string;
  qty: number;
  unitPriceCents: number;
};

export type CartTotals = {
  currency: string;
  itemsCount: number;
  subtotalCents: number;
};

export const formatMoney = (valueCents: number, currency: string): string =>
  new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valueCents / 100);

export const calculateTotals = (items: CartItem[], currency = 'PLN'): CartTotals => {
  const subtotalCents = items.reduce((acc, item) => acc + item.unitPriceCents * item.qty, 0);
  const itemsCount = items.reduce((acc, item) => acc + item.qty, 0);

  return { currency, itemsCount, subtotalCents };
};

type CartWidgetProps = {
  items: CartItem[];
  currency?: string;
  heading?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export const CartWidget: React.FC<CartWidgetProps> = ({
  items,
  currency = 'PLN',
  heading = 'Twój koszyk',
  ctaHref = '/cart',
  ctaLabel = 'Przejdź do koszyka'
}) => {
  const totals = calculateTotals(items, currency);

  return (
    <section
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '1rem',
        maxWidth: 520,
        background: '#f8fafc'
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{heading}</h2>
        <span style={{ color: '#475569', fontSize: '0.95rem' }}>{totals.itemsCount} szt.</span>
      </header>
      <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'grid', gap: '0.5rem' }}>
        {items.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fff',
              borderRadius: '0.5rem',
              padding: '0.75rem 0.9rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {item.qty} × {formatMoney(item.unitPriceCents, currency)}
              </div>
            </div>
            <div style={{ fontWeight: 600 }}>{formatMoney(item.qty * item.unitPriceCents, currency)}</div>
          </li>
        ))}
      </ul>
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#475569' }}>Suma</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          {formatMoney(totals.subtotalCents, totals.currency)}
        </div>
      </footer>
      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
        <a
          href={ctaHref}
          style={{
            display: 'inline-block',
            background: '#0f172a',
            color: '#fff',
            padding: '0.6rem 1rem',
            borderRadius: '0.6rem',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
};

export default {
  CartWidget,
  calculateTotals,
  formatMoney
};
