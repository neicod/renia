# renia-interceptors

Moduł narzędziowy do uruchamiania interceptorów z modułów. Interceptor to po prostu plik wykonywany dla efektów ubocznych (np. dopięcie elementu do slotu, rejestracja logiki), bez narzuconego formatu danych. Pliki leżą w `interceptors/` modułu: `default.(ts|js)` (global) oraz `<kontekst>.(ts|js)` (np. `cart`).

## Jak działa
- Korzysta z `renia-module-registry`, więc ładuje interceptory tylko z aktywnych modułów.
- Szuka w każdym aktywnym module folderu `interceptors/`:
  - `default.ts` / `default.js` — ładowane zawsze.
  - `<context>.ts` / `<context>.js` — ładowane, gdy wywołasz loader z danym kontekstem (np. `cart`).
- Każdy plik jest importowany i, jeśli eksport domyślny jest funkcją, wywoływany z przekazanym kontekstem API i nazwą kontekstu.

## API
```ts
import { loadInterceptors } from 'renia-interceptors';

// przykładowe API kontekstu, które podajesz interceptorom:
const api = {
  slots: { add: (entry) => {/* ... */} },
  router: { add: (route) => {/* ... */} },
  log: console
};

await loadInterceptors('cart', { configPath: 'app/etc/config.json' }, api);
// najpierw uruchomi default.* ze wszystkich aktywnych modułów, potem cart.* ze wszystkich aktywnych modułów.
```

### Opcje
- `configPath` — ścieżka do pliku z mapą statusów modułów (`app/etc/config.json` domyślnie).
- `includeNodeModules` — czy czytać też moduły z `node_modules` (domyślnie true).
- `statusMap` — nadpisanie statusów w locie.
- `onError` — callback błędów (np. logowanie); domyślnie ostrzeżenie w konsoli.

## Kontrakt plików interceptorów
- `interceptors/default.ts` (globalnie) i `interceptors/<kontekst>.ts` (np. `cart.ts`).
- Eksport domyślny może być funkcją `(api, context) => { /* efekty uboczne */ }`; jeśli to nie funkcja, sam import pozwala wykonać logikę modułu.
- Kontekst jest stringiem przekazanym do `loadInterceptors` (np. `'cart'`).

## Przykład w module
`modules/renia-magento-cart/interceptors/cart.ts`:
```ts
import { CartWidget } from 'renia-magento-cart';

export default (api) => {
  api.slots?.add?.({ slot: 'control-menu', component: CartWidget, priority: 90 });
  api.log?.info?.('Interceptor koszyka uruchomiony');
};
```

## Uwagi
- Kolejność: najpierw `default.*`, potem `<kontekst>.*`, w kolejności aktywnych modułów; brak priorytetów między modułami — jeśli potrzebujesz, rozważ konwencję w nazwach plików (np. `10-default.js`), ale nie jest ona zaimplementowana.
- Obsługa błędów: błąd w jednym pliku nie przerywa reszty; jest logowany (lub kierowany do `onError`).
