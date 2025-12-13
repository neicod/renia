# Renia Storefront (React SSR)

Centralna dokumentacja aplikacji znajdującej się w katalogu `frontend`. Zawiera przegląd architektury, głównych modułów i procesów wymaganych przy rozwoju.

## Spis treści
1. [Architektura i przepływ danych](#architektura-i-przepływ-danych)
2. [Kontekst aplikacji i konfiguracja sklepu](#kontekst-aplikacji-i-konfiguracja-sklepu)
3. [Warstwa GraphQL i augmentery](#warstwa-graphql-i-augmentery)
4. [System modułów, slotów i interceptorów](#system-modułów-slotów-i-interceptorów)
5. [Przechowywanie danych w przeglądarce](#przechowywanie-danych-w-przeglądarce)
6. [Koszyk i CartManager](#koszyk-i-cartmanager)
7. [Listing produktów i wyszukiwarka](#listing-produktów-i-wyszukiwarka)
8. [Środowiska, build i testy](#środowiska-build-i-testy)
9. [Debugowanie i logowanie](#debugowanie-i-logowanie)
10. [Moduły – opis szczegółowy](#moduły--opis-szczegółowy)

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
- **Lokalizacja modułów:** nadal wspieramy historyczny katalog `modules/`, ale własne moduły najlepiej umieszczać w `app/modules/<vendor>/<module>` i instalować je ręcznie przez `npm install <nazwa>@file:app/modules/<vendor>/<module>`. Dzięki temu importy działają jak przy zwykłych paczkach npm, a loader SSR automatycznie wczytuje rejestracje z obu lokalizacji.
- **Rejestr komponentów:** `registerComponent(s)` w `registerComponents.ts`; nazwy komponentów podaj jako stringi (bare specifiers), bo pliki ładowane są zarówno na SSR, jak i w bundlu klienta.
- **Interceptory:** eksportują funkcję wywoływaną z API `slots.add` / `subslots.add`. Przy ich pomocy moduł może np. wstrzyknąć listing produktów na stronę kategorii.
- **Zależności modułów:** zadeklaruj w `registration.ts` (`dependencies`), by loader wiedział, że moduł wymaga innych paczek.

### Interceptory – kiedy i jak ich używać

Interceptory to preferowana metoda rozszerzania UI poza „własnym” modułem. Używaj ich gdy:
- musisz dodać/wyłączyć komponent w określonym slocie (`control-menu`, `content`, `left` itd.),
- potrzebujesz reakcji na kontekst trasy (np. tylko dla `/category/*`, `/search`, `/product/:urlKey`),
- chcesz zarejestrować SSR-owe dane (np. przekazać `initialListing` do slotu).

Przykład interceptora w module katalogu (`app/modules/renia/magento-catalog/interceptors/category.ts`):

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

## Przechowywanie danych w przeglądarce

1. **Centralny serwis `browserStorage`.** Wszystkie interakcje z `localStorage` przechodzą przez `@framework/storage/browserStorage`. Dzięki temu mamy 1) bezpieczny fallback poza przeglądarką, 2) statystyki odczytów/zapisów (`getUsageSnapshot()`).
2. **Zasada projektu.** Nie importuj `window.localStorage` ani `sessionStorage` bezpośrednio w modułach – zamiast tego korzystaj z metod `browserStorage.getItem/setItem/removeItem`. Ułatwia to audyt użyć i wymusza jednolitą obsługę błędów.
3. **Cache + TTL.** Moduły, które cache’ują dane (np. `renia-module-cart`), muszą przechowywać w strukturze `updatedAt` i usuwać przeterminowane wpisy (koszyk: 1 h). Dzięki temu UI nie będzie pokazywał nieaktualnych danych po powrocie użytkownika.
4. **Hydratacja vs. SSR.** Dane zależne od użytkownika (np. liczba elementów koszyka) nie są renderowane na SSR – dopiero klient odczytuje je z `browserStorage`. To podejście jest bezpieczne przy użyciu cache’ów HTTP/Varnisha.

## Koszyk i CartManager

1. **Warstwy odpowiedzialności.** `renia-magento-cart` ma rozbitą logikę na repozytorium (`services/cartRepository.ts`), mapper (`cartMapper.ts`), synchronizator stanu (`cartStateSync.ts`) oraz menedżera (`services/cartManager.ts`). Dzięki temu łatwo wymienić pojedyncze warstwy w testach lub innych implementacjach.
2. **`CartManagerProvider`.** Moduł eksportuje `CartManagerProvider` i hook `useCartManager()` (`import { CartManagerProvider, useCartManager } from 'renia-magento-cart'`). Domyślnie komponenty korzystają z globalnej instancji, ale można w testach opakować fragment drzewa własną implementacją menedżera.
3. **Aktualizowanie liczby produktów.** `renia-module-cart` publikuje skrócone podsumowanie (`readCartQuantitySummary()` + `subscribeToCartQuantity()`), z którego korzysta m.in. `CartControlLink`. Dzięki temu licznik jest widoczny natychmiast po hydratacji, a każda operacja koszyka odświeża cache w `browserStorage`.
4. **Obsługa błędów.** `registerCartErrorHandler()` pozwala innym modułom (np. `renia-magento-customer`) reagować na błędy koszyka – np. automatycznie odświeżyć sesję. Korzystaj z tego API zamiast ręcznie opakowywać każdą operację.

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
