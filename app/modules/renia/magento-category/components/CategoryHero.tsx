// @env: mixed
import React from 'react';

type CategoryLike = {
  label?: string;
  description?: string;
  image?: string;
};

type Props = {
  category?: CategoryLike | null;
  meta?: Record<string, unknown>;
};

export const CategoryHero: React.FC<Props> = ({ category: categoryProp, meta }) => {
  const category = React.useMemo<CategoryLike | null>(
    () => categoryProp ?? ((meta as any)?.category as CategoryLike | null) ?? null,
    [categoryProp, meta]
  );

  const label = typeof category?.label === 'string' ? category.label : '';
  if (!label) return null;

  const description = typeof category?.description === 'string' ? category.description : '';
  const image = typeof category?.image === 'string' ? category.image : '';

  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `/static/catalog/category/${image}`
    : '';

  return (
    <section
      style={{
        marginBottom: '2rem',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.1)',
        background: '#fff'
      }}
    >
      {imageUrl ? (
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
            alt={label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
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
      ) : null}

      <div style={{ padding: imageUrl ? '2.5rem 2rem 2rem' : '2rem' }}>
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
          {label}
        </h1>

        {description ? (
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
            dangerouslySetInnerHTML={{ __html: description }}
          />
        ) : null}
      </div>
    </section>
  );
};

export default CategoryHero;

