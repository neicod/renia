// @env: mixed
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const SearchBar: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const currentQuery = params.get('q') ?? params.get('query') ?? '';
  const [value, setValue] = React.useState(currentQuery);

  React.useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const isClient = typeof window !== 'undefined';
      if (isClient) {
        event.preventDefault();
      }
      const trimmed = value.trim();
      const target = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
      if (isClient) {
        navigate(target);
      }
    },
    [navigate, value]
  );

  return (
    <form
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        border: '1px solid #d1d5db',
        background: '#fff'
      }}
    >
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Szukaj produktów"
        style={{
          border: 'none',
          outline: 'none',
          minWidth: '160px',
          fontSize: '0.95rem'
        }}
      />
      <button
        type="submit"
        style={{
          border: 'none',
          background: '#2563eb',
          color: '#fff',
          borderRadius: '999px',
          padding: '0.35rem 0.9rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Szukaj
      </button>
    </form>
  );
};

export default SearchBar;
