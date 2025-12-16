// @env: browser

import React from 'react';
import type { Category } from '../types/category';

type Props = {
  meta?: Record<string, unknown>;
  category?: Category;
};

export const CategoryHeader: React.FC<Props> = ({ meta, category: categoryProp }) => {
  const category = React.useMemo(() => categoryProp ?? (meta as any)?.category, [categoryProp, meta]);

  if (!category || !category.label) {
    return null;
  }

  const imageUrl = category.image ? (
    // Magento typically returns relative paths for category images
    category.image.startsWith('http')
      ? category.image
      : `/static/catalog/category/${category.image}`
  ) : null;

  return (
    <div
      style={{
        marginBottom: '2rem',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)',
        background: '#fff'
      }}
    >
      {imageUrl && (
        <div
          style={{
            width: '100%',
            height: '300px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e2e8f0 100%)',
            position: 'relative'
          }}
        >
          <img
            src={imageUrl}
            alt={category.label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          {/* Overlay gradient na zdjęciu */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.3), transparent)',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}
      <div
        style={{
          padding: imageUrl ? '2.5rem 2rem 2rem' : '2rem',
          background: '#fff'
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 0.75rem 0',
            lineHeight: 1.2,
            letterSpacing: '-0.01em'
          }}
        >
          {category.label}
        </h1>
        {category.description && (
          <div
            style={{
              fontSize: '1rem',
              color: '#475569',
              lineHeight: 1.6,
              marginTop: '1rem',
              maxWidth: '800px',
              fontWeight: 400,
              letterSpacing: '0.3px'
            }}
            dangerouslySetInnerHTML={{ __html: category.description }}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryHeader;
