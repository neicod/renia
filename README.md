# Renia Storefront (React SSR)

Centralna dokumentacja aplikacji znajdującej się w katalogu `frontend`. Zawiera przegląd architektury, głównych modułów i procesów wymaganych przy rozwoju.

## Spis treści
1. [Architektura i przepływ danych](#architektura-i-przepływ-danych)
2. [Kontekst aplikacji i konfiguracja sklepu](#kontekst-aplikacji-i-konfiguracja-sklepu)
3. [Warstwa GraphQL i augmentery](#warstwa-graphql-i-augmentery)
4. [System modułów, slotów i interceptorów](#system-modułów-slotów-i-interceptorów)
5. [Listing produktów i wyszukiwarka](#listing-produktów-i-wyszukiwarka)
6. [Środowiska, build i testy](#środowiska-build-i-testy)
7. [Debugowanie i logowanie](#debugowanie-i-logowanie)
8. [Moduły – opis szczegółowy](#moduły--opis-szczegółowy)

---

## Architektura i przepływ danych

1. **SSR + hydratacja.** Serwer (`src/server/index.tsx`) renderuje `AppRoot`, wstrzykuje wynik do `htmlTemplate`, a klient (`src/client/index.tsx`) hydratyzuję markup poprzez `BrowserRouter`. Statyczne zasoby serwowane są z `dist/public` pod `/static`.
2. **Rejestr modułów.** Framework automatycznie ładuje aktywne moduły z `frontend/modules` (statusy w `app/etc/config.json`). Każdy moduł może dostarczać:
   - trasy (`routes.ts`),
   - layouty / sloty (`layout.*`),
   - interceptory (`interceptors/<kontekst>.ts`),
   - komponenty (`registerComponents.ts`).
3. **Layout + sloty.** `LayoutShell` renderuje sloty `header`, `control-menu`, `content`, `left`, `footer` i wstrzykuje do nich komponenty z modułów. Slots entry sortowane są wg `priority`.
4. **Router i interceptory.** Podczas SSR router identyfikuje trasę, uruchamia odpowiednie interceptory (globalne `default`, kontekstowe np. `control-menu`, `category`) i pozwala modułom na wstrzykiwanie komponentów do slotów.

## Kontekst aplikacji i konfiguracja sklepu

- **AppEnvironment** (`src/framework/runtime/AppEnvContext.tsx`) udostępnia:
  - `runtime`: `ssr` / `client`,
  - `storeCode`: kod sklepu (z konfiguracji lub `.env`),
  - `store`: znormalizowane `StoreConfig`.
- **Moduł `renia-magento-store`.**
  - `getStoreConfig()` wykonuje zapytanie `storeConfig`, cache’uje wynik (statyczny cache + in-flight promise) i automatycznie rejestruje nagłówek `store`.
  - Plik `services/storeHeaders.ts` rejestruje globalny augmenter nagłówków, który dokleja `store` do każdego zapytania GraphQL – na SSR i w przeglądarce.
- **Wykorzystanie kontekstu.** W `AppRoot` storeConfig jest przekazywany do provider’a, a komponenty (np. `LayoutShell`, `useStorefrontPageSize`) korzystają z niego bez dodatkowych zapytań.

## Warstwa GraphQL i augmentery

1. **Podstawowa warstwa** (`renia-graphql-client`):
   - `QueryBuilder` – deklaratywne budowanie zapytań (fields, fragmenty, inline fragmenty).
   - `executeRequest(request)` – wysyła zapytania, loguje request/response i obsługuje timeout/401/403.
2. **Fabryka Magento** (`renia-magento-graphql-client`):
   - `MagentoGraphQLRequestFactory.create()` zapewnia prawidłowy endpoint i akceptuje `operationId`.
3. **Augmentery** (`src/framework/api/graphqlClient.ts`):
   - `registerGraphQLHeaderAugmenter(fn)` – globalnie dokleja nagłówki do wszystkich requestów (np. `store`, `authorization`).
   - `registerGraphQLQueryAugmenter(fn)` – pozwala modyfikować payload `QueryBuilder` przed wysłaniem (np. dołożyć pola). Funkcja otrzymuje `operationId` i `variables`.
   - `executeGraphQLRequest(request, { headerAugmenters?, queryAugmenters? })` – używane obecnie przez wszystkie repozytoria; zapewnia spójne logowanie i augmentację.
4. **Jak dodać nagłówek / zmodyfikować query?**
   ```ts
   import { registerGraphQLHeaderAugmenter, registerGraphQLQueryAugmenter } from '@framework/api/graphqlClient';

   registerGraphQLHeaderAugmenter((headers) => {
     headers['x-session'] = getSessionId();
   });

   registerGraphQLQueryAugmenter((payload, ctx) => {
     if (ctx.operationId !== 'magentoProduct.search' || !(payload instanceof QueryBuilder)) return;
     payload.addField(['products'], 'items_count'); // przykład dodatkowego pola
   });
   ```

## System modułów, slotów i interceptorów

- **Struktura modułu:** `package.json`, `registration.ts`, ewentualnie `routes.ts`, `layout.ts`, `interceptors/*`, `registerComponents.ts`, assets.
- **Rejestr komponentów:** `registerComponent(s)` w `registerComponents.ts`; nazwy komponentów podaj jako stringi (bare specifiers), bo pliki ładowane są zarówno na SSR, jak i w bundlu klienta.
- **Interceptory:** eksportują funkcję wywoływaną z API `slots.add` / `subslots.add`. Przy ich pomocy moduł może np. wstrzyknąć listing produktów na stronę kategorii.
- **Zależności modułów:** zadeklaruj w `registration.ts` (`dependencies`), by loader wiedział, że moduł wymaga innych paczek.

### Interceptory – kiedy i jak ich używać

Interceptory to preferowana metoda rozszerzania UI poza „własnym” modułem. Używaj ich gdy:
- musisz dodać/wyłączyć komponent w określonym slocie (`control-menu`, `content`, `left` itd.),
- potrzebujesz reakcji na kontekst trasy (np. tylko dla `/category/*`, `/search`, `/product/:urlKey`),
- chcesz zarejestrować SSR-owe dane (np. przekazać `initialListing` do slotu).

Przykład interceptora w module katalogu (`modules/renia-magento-catalog/interceptors/category.ts`):

```ts
// @env: mixed
import type { InterceptorApi } from 'renia-interceptors';

export default async function categoryInterceptor(api: InterceptorApi) {
  api.slots.add({
    slot: 'content',
    componentPath: 'renia-magento-catalog/components/CategoryProductList',
    id: 'category-product-list',
    priority: 20,
    props: { /* np. categoryUrlPath podany przez route handler */ }
  });
}
```

- `interceptors/default.ts` działa globalnie dla każdej trasy.
- Nazwy kontekstów (`control-menu`, `category`, `search` itd.) odpowiadają temu, co serwer przekazuje do loadera interceptorów (`loadInterceptors(context, ...)`).
- Aby „wyłączyć” element slotu z innego modułu, dodaj wpis z tym samym `id` i `enabled: false`.

### Plik `routes.ts`

Trasy są serializowane i wczytywane przez framework. W pliku eksportuj tablicę obiektów:

```ts
// @env: mixed
import type { RouteEntry } from '@framework/router';

const routes: RouteEntry[] = [
  {
    path: '/search',
    componentPath: 'renia-magento-catalog-search/components/SearchProductList',
    layout: '1column',
    priority: 50,
    meta: { type: 'search' }
  }
];

export default routes;
```

- `componentPath` musi wskazywać na komponent zarejestrowany w `registerComponents.ts`.
- `layout` (domyślnie `1column`) określa, który layout ma być użyty przy renderze.
- `priority` ustala kolejność dopasowywania (niższy = później). Używaj gdy trasy mogą się nakładać.

### Plik `layout.ts`

Layout opisuje, jakie komponenty domyślnie trafiają do slotów w danym module. Przykład:

```ts
// @env: mixed
export default [
  { slot: 'control-menu', component: 'renia-magento-cart/components/CartControlLink', priority: 90 },
  { slot: 'control-menu', component: 'magento-wishlist/components/WishlistControlLink', priority: 80 }
];
```

- `component` przyjmuje bare specifier zarejestrowanego komponentu.
- `priority` pozwala dowolnym modułom mieszać się w jednym slocie (większy = wyżej).
- Layouty nie renderują komponentów same – `LayoutShell` wczytuje definicje i decyduje o kolejności.
- Slot `global-overlay` renderuje się na końcu layoutu (poza strukturą strony) i służy do elementów overlay (np. toastów). Dodawaj wpisy przez `api.slots.add({ slot: 'global-overlay', ... })`.

### `registerComponents.ts`

Każdy moduł powinien rejestrować swoje komponenty w jednym miejscu:

```ts
// @env: mixed
import { registerComponent } from '@framework/registry/componentRegistry';
import SearchProductList from './components/SearchProductList';

registerComponent('renia-magento-catalog-search/components/SearchProductList', SearchProductList);
```

- Nazwa (`componentPath`) powinna być unikalna i pasować do ścieżek używanych w slotach/trailach.
- Serwer automatycznie ładuje `registerComponents.ts` wszystkich aktywnych modułów, więc unikaj dodatkowych efektów ubocznych.

### Sloty wewnętrzne na listingu i karcie produktu

- `magento-product/components/ProductTile` emituje slot `product-listing-actions`, przekazując w `props` bieżący `product`.
- `magento-product/pages/components/ProductDetails` emituje slot `product-view-actions` (również z `product`).
- Aby dołożyć własną akcję (np. przycisk „Dodaj do koszyka”), dodaj w interceptorze wpis:
  ```ts
  api.subslots.add({
    slot: 'product-listing-actions',
    componentPath: 'renia-magento-cart/components/AddToCartButton',
    priority: 10
  });
  ```
- Sloty działają na SSR i w kliencie; kolejność kontrolujesz `priority`, a wyłączenie następuje przez `enabled: false`.

## Listing produktów i wyszukiwarka

- **`renia-magento-catalog`** odpowiada za listing na stronach kategorii.
  - `useProductListing` + `useStorefrontPageSize` zarządzają stanem, sortowaniem, paginacją i pageSize z konfiguracji sklepu.
  - SSR potrafi przekazać `initialListing` (prefetch) do komponentu `CategoryProductList`, aby uniknąć migania przy nawigacji.
  - Moduł posiada własny provider (`services/storefrontConfig.ts`), który odczytuje `grid_per_page` z `storeConfig.raw` (augmenter dodaje pola do zapytania) i udostępnia dane hookom.
- **`renia-magento-catalog-search`** dostarcza komponent wyszukiwarki (`SearchBar`) i wyniki (`SearchProductList`), współdzieląc logikę z listingiem kategorii.
- **`magento-product`**:
  - `productRepository` (tylko `getList` i `getByUrlKey`) – wszystkie inne operacje są wyprowadzone do osobnych helperów (`productSearchRequest`, `productSearchResponse`, `productMapper`).
  - Zapytania zbudowane są na QueryBuilderze z fragmentem `ProductInList`.

## Środowiska, build i testy

| Tryb                 | Komenda                                               | Uwagi                                                                 |
|----------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| Dev (SSR)            | `npm run dev:server`                                   | SSR z `tsx`, port 3000, watch w kodzie serwera.                       |
| Dev (klient)         | `npm run dev:client`                                   | Watcher bundla (esbuild) zapisuje do `dist/public`.                   |
| Build prod           | `npm run build`                                        | Buduje klienta (minifikacja + code splitting) i serwer.               |
| Start prod           | `NODE_PATH=./modules node dist/server/index.js`        | Po buildzie, serwuje `/static` z `dist/public`.                       |
| Testy modułowe       | `npm test`                                             | Używa `tsx --test`; testy znajdują się w `tests/*.test.ts`.           |

**Wymagane zmienne środowiskowe (SSR):**
- `MAGENTO_GRAPHQL_ENDPOINT` – adres upstream GraphQL Magento.
- `MAGENTO_PROXY_ENDPOINT` (opcjonalnie, default `/api/magento/graphql`).
- `MAGENTO_STORE_CODE`, `MAGENTO_ROOT_CATEGORY_ID`, `MAGENTO_HOST_HEADER` – w razie multi-store / innych originów.

## Debugowanie i logowanie

- `GraphQL` – requesty i odpowiedzi logowane przez `executeRequest` (można wyłączyć zmiennymi `GRAPHQL_LOG_REQUEST=0`, `GRAPHQL_LOG_RESPONSE=0`).
- `CategoryProductList` oraz hooki listingowe posiadają `console.info` z oznaczeniem `[CategoryProductList]`/`[useCategoryProductList]`.
- `request.ts` w proxy loguje błędy upstream.
- Przy problemach z hydratacją sprawdź ostrzeżenia Reacta w konsoli i porównaj `window.__APP_BOOTSTRAP__`.

## Moduły – opis szczegółowy

Szczegółowy opis każdego modułu, jego odpowiedzialności i kluczowych plików znajdziesz w [`docs/MODULES.md`](docs/MODULES.md).

---

**Dodatkowe zasoby**
- Instrukcje operacyjne dla agentów: [`AGENT_INSTRUCTIONS.md`](AGENT_INSTRUCTIONS.md)
- Dokumentacja modułów: [`docs/MODULES.md`](docs/MODULES.md)
