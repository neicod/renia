import React from 'react';

const items = [
  { label: 'Nowości', href: '/category/new' },
  { label: 'Kobiety', href: '/category/women' },
  { label: 'Mężczyźni', href: '/category/men' },
  { label: 'Wyprzedaż', href: '/category/sale' }
];

export const CategoryMainMenu: React.FC = () => (
  <nav style={{ display: 'flex', gap: '1rem' }}>
    {items.map((item) => (
      <a
        key={item.href}
        href={item.href}
        style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600 }}
      >
        {item.label}
      </a>
    ))}
  </nav>
);

export default CategoryMainMenu;
