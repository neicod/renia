# renia-graphql-client

Moduł do budowania i wykonywania zapytań GraphQL. Obsługuje:
- Obiektowy builder zapytań/mutacji (`QueryBuilder`).
- Serializację do stringa lub obiektu `{ query, variables }`.
- Wysyłanie requestów z autoryzacją (Bearer, Basic, własne nagłówki), timeoutem i prostą obsługą błędów.

## API główne
- `QueryBuilder(type: 'query' | 'mutation')` — budowa zapytań/mutacji.
- `executeRequest(request: GraphQLRequest)` — wykonanie zapytania/mutacji.

## Typy pomocnicze
- `GraphQLRequest`:
  - `endpoint: string`
  - `method?: 'GET' | 'POST' | 'PUT' | 'DELETE'` (domyślnie `POST`)
  - `payload: string | Operation | QueryBuilder`
  - `variables?: Record<string, unknown>`
  - `headers?: Record<string, string>`
  - `auth?: Array<BearerAuth | BasicAuth | HeaderAuth>`
  - `timeoutMs?: number` (domyślnie 5000ms; po przekroczeniu rzuca wyjątek)
- Auth:
  - Bearer: `{ type: 'bearer', token }`
  - Basic: `{ type: 'basic', username, password }`
  - Custom header: `{ type: 'header', name, value }`

## Przykłady — builder
### Nowy (preferred) fluent API — czytelne modyfikacje selekcji
Możesz używać helpera `gql` do czytelnych, wielolinijkowych snippetów (automatyczny dedent/trim).

```ts
import { QueryBuilder, gql } from 'renia-graphql-client';

const qb = new QueryBuilder('mutation').setName('RemoveItemFromCart');

// Najpierw tworzysz pole (np. z args) w formie snippetu:
qb.add(gql`
  removeItemFromCart(input: $input)
`);

// Potem łatwo doklejasz selekcję jako snippet (merge bez duplikatów):
qb.at('removeItemFromCart').add('user_errors { code message }');
```

Ważne:
- `qb.at('a.b.c')` **nie tworzy** brakujących segmentów — jeśli ścieżka nie istnieje, rzuca wyjątek.
- `add/merge` robi domyślny merge (dopina brakujące pola, bez duplikatów); konflikty `args` są nadpisywane z `console.warn`.

### Proste zapytanie
```ts
import { QueryBuilder, gql } from 'renia-graphql-client';

const q = new QueryBuilder('query')
  .setName('GetCart')
  .setVariable('id', 'ID!')
  .add(gql`
    cart(id: $id) { id total }
  `);

console.log(q.toString());
// query GetCart($id: ID!) { cart(id: $id) { id total } }
```

### Rozbudowa selekcji przez inne moduły
```ts
// moduł A
const q = new QueryBuilder('query').setName('GetCart');
q.add(gql`
  cart { id }
`);

// moduł B (dostaje tę samą instancję)
q.at('cart').add(gql`
  items(limit: 10) { sku qty }
`);
```

### Fragmenty i inline fragmenty
```ts
q.addFragment('ItemFields', 'sku name', 'CartItem');

q.at('cart.items').add('...ItemFields');

q.at('cart').add(gql`
  ... on Bundle { bundleItems { sku } }
`);
```

### Usuwanie pola
```ts
q.at('cart').remove('total'); // wycina pole total z selekcji cart
```

> Uwaga: `addField/removeField/spreadFragment/inlineFragment` są utrzymywane dla kompatybilności, ale preferowane jest nowe API `at(...).add/merge/remove`.

### Obiekt operacji i string
```ts
const op = q.toObject();  // serializowalny obiekt Operation
const str = q.toString(); // string zapytania
```

## Przykłady — wykonanie requestu
### Podstawowe zapytanie POST
```ts
import { executeRequest, QueryBuilder } from 'renia-graphql-client';

const qb = new QueryBuilder('query')
  .setName('GetWishlist')
  .add(gql`
    wishlist { id name }
  `);

const res = await executeRequest({
  endpoint: 'https://example.com/graphql',
  payload: qb,
  auth: [{ type: 'bearer', token: 'abc123' }],
  timeoutMs: 7000
});

if (res.errors) {
  console.error(res.errors);
} else {
  console.log(res.data);
}
```

### Zapytanie GET z query string
```ts
const res = await executeRequest({
  endpoint: 'https://example.com/graphql',
  method: 'GET',
  payload: '{ ping }'
});
```

### Basic auth + dodatkowy nagłówek
```ts
await executeRequest({
  endpoint: 'https://example.com/graphql',
  payload: '{ viewer { id } }',
  auth: [
    { type: 'basic', username: 'u', password: 'p' },
    { type: 'header', name: 'x-api-key', value: 'key123' }
  ]
});
```

### Timeout i obsługa błędów
- `timeoutMs` (domyślnie 5000) — po przekroczeniu rzuca `Error("GraphQL request timed out ...")`.
- Status 401/403 rzuca `Error("Auth error: HTTP ...")`.
- Inne błędy `fetch` są propagowane.

## Uwagi
- `payload` może być stringiem lub obiektem/builderem; dla buildera zmienne są brane z `toObject()` lub z `variables` przekazanych w request.
- Brak hooka na transport; używany jest wbudowany `fetch`.
- Fragmenty/inline fragmenty są wspierane w builderze; wynik jest deterministycznie generowany (sortowanie pól zależy od kolejności dodawania).
