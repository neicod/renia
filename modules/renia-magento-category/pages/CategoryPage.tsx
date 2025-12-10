import React from 'react';
import { useParams } from 'react-router-dom';

export const CategoryPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug ?? 'category';

  return (
    <section style={{ display: 'grid', gap: '0.75rem' }}>
      <h1>Kategoria: {slug}</h1>
      <p>To jest widok kategorii. Tu pojawi się lista produktów dla: {slug}.</p>
    </section>
  );
};

export default CategoryPage;
