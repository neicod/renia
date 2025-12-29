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
      const next = new URLSearchParams();
      if (trimmed) next.set('q', trimmed);
      const qs = next.toString();
      const target = qs ? `/search?${qs}` : '/search';
      if (isClient) {
        navigate(target);
      }
    },
    [navigate, value]
  );

  return (
    <form action="/search" method="get" onSubmit={handleSubmit} className="search-bar">
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Szukaj produktów"
        className="search-input"
      />
      <button type="submit" className="search-button" aria-label="Wyszukaj produkty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.65" y1="16.65" x2="21" y2="21" />
        </svg>
        Szukaj
      </button>
    </form>
  );
};

export default SearchBar;
