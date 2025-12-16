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
   - interceptory (`interceptors/<kontekst>.ts`),
   - page komponenty (dla modułów z trasami),
   - komponenty (`registerComponents.ts`).
3. **Template-Based Layout System.** Zamiast globalnego `LayoutShell` z hardcoded HTML, każdy route wybiera konkretny layout component:
   - Layout to pełny komponent React (np. `1column.tsx`, `2columns-left.tsx`), którym developerowie mogą zarządzać
   - Layout components znajdują się w `app/modules/renia/layout/layouts/` i są zarejestrowane w interceptorach
   - Sloty (`header`, `control-menu`, `content`, `left`, `footer`, `global-overlay`) są renderowane do `React.ReactNode` i przekazane do layout komponenty
   - `LayoutShell` orchestruje renderowanie slotów i ładowanie layout komponenty
4. **Router i interceptory.** Podczas SSR router identyfikuje trasę i jej layout, uruchamia odpowiednie interceptory (globalne `default`, kontekstowe np. `category`) i pozwala modułom na wstrzykiwanie komponentów do slotów.

## Kontekst aplikacji i konfiguracja sklepu

- **AppEnvironment** (`src/framework/runtime/AppEnvContext.tsx`) udostępnia:
  - `runtime`: `ssr` / `client`,
  - `storeCode`: kod sklepu (z konfiguracji lub `.env`),
  - `store`: znormalizowane `StoreConfig`.
- **Moduł `renia-magento-store`.**
- **Moduły koszyka:** `renia-magento-cart` (logika/akcje/sloty koszyka) + `renia-magento-cart-sidebar` (wysuwany panel bazujący na tym samym stanie). Sidebara nie renderujemy na SSR; korzysta z istniejącego cache koszyka (TTL 1 h w `browserStorage`, 7 dni dla `cartId`).
- **Moduł `renia-i18n`:** globalny provider tłumaczeń; klucze semantyczne, placeholdery `:name` i `%1`; tłumaczenia z `app/modules/*/i18n` scalane z override `app/i18n` podczas `npm run build:i18n`.
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

- **Struktura modułu:** `package.json`, `registration.ts`, ewentualnie `routes.ts`, `interceptors/*`, `registerComponents.ts`, page komponenty (jeśli moduł ma `routes.ts`), assets.
- **Lokalizacja modułów:** nadal wspieramy historyczny katalog `modules/`, ale własne moduły najlepiej umieszczać w `app/modules/<vendor>/<module>` i instalować je ręcznie przez `npm install <nazwa>@file:app/modules/<vendor>/<module>`. Dzięki temu importy działają jak przy zwykłych paczkach npm, a loader SSR automatycznie wczytuje rejestracje z obu lokalizacji.
- **Rejestr komponentów:** Komponenty są rejestrowane w interceptorach (`api.registerComponents({...})`), a nie w osobnym `registerComponents.ts`. Nazwy komponentów podaj jako stringi (bare specifiers), bo pliki ładowane są zarówno na SSR, jak i w bundlu klienta.
- **Interceptory:** eksportują funkcję wywoływaną z API `api.registerComponents({...})`, `api.extension(...)`, `api.subslots.add(...)`. Przy ich pomocy moduł może np. wstrzyknąć listing produktów na stronę kategorii.
- **Zależności modułów:** zadeklaruj w `registration.ts` (`dependencies`), by loader wiedział, że moduł wymaga innych paczek.
- **Page komponenty:** Moduły z `routes.ts` muszą mieć page komponenty (np. `WishlistPage.tsx`) w katalogu `pages/`. Route wskazuje na ten komponent przez `componentPath`.

### Interceptory – kiedy i jak ich używać

Interceptory to preferowana metoda rozszerzania UI poza „własnym” modułem. Zawsze przed zmianami przejrzyj `docs/concept.md` w danym module. Używaj interceptorów gdy:
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
    componentPath: 'renia-magento-catalog-search/pages/SearchPage',
    priority: 50,
    meta: {
      layout: 'renia-layout/layouts/2columns-left',
      type: 'search'
    }
  }
];

export default routes;
```

- `componentPath` musi wskazywać na page komponent zarejestrowany w interceptorach.
- **Layout specification:** Umieść `layout` w `meta.layout` i podaj **pełną ścieżkę** do komponentu layoutu (np. `'renia-layout/layouts/2columns-left'`). Layout components znajdują się w `app/modules/renia/layout/layouts/` i są zarejestrowane w interceptorach.
  - Dostępne layouty: `'renia-layout/layouts/1column'`, `'renia-layout/layouts/2columns-left'`, `'renia-layout/layouts/empty'`
  - Domyślny: `'renia-layout/layouts/1column'`
- `priority` ustala kolejność dopasowywania (niższy = później). Używaj gdy trasy mogą się nakładać.
- `contexts` (tablica) – określa, które interceptory będą załadowane dla tej trasy. Zwykle zawiera nazwę modułu lub typ strony (np. `['category']`, `['search']`).

### Template-Based Layout Components

Zamiast globalnego systemu layoutów w `layout.ts`, każdy layout to niezależny komponent React w `app/modules/renia/layout/layouts/`:

```tsx
// @env: mixed
// app/modules/renia/layout/layouts/2columns-left.tsx
import React from 'react';

type LayoutProps = {
  slots: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function Layout2ColumnsLeft({ slots, main }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="header__controls">{slots['control-menu']}</div>
        <nav>{slots.header}</nav>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
        <aside>{slots.left}</aside>
        <main className="main">
          {slots.content}
          {main}
        </main>
      </div>

      <footer>{slots.footer}</footer>
      {slots['global-overlay']}
    </div>
  );
}
```

- Layout komponenty są zarządzane jak zwykłe komponenty – zarejestrowane w `interceptors/default.ts` i zrelacjonowane jako `componentPath` w route `meta.layout`.
- Sloty (`header`, `control-menu`, `content`, `left`, `footer`, `global-overlay`) są już pre-renderowane i przekazane jako `React.ReactNode`.
- Developer ma pełną kontrolę nad HTML, strukturą i stylami wewnątrz komponentu layoutu.
- Aby dodać nowy layout, utwórz nowy plik `.tsx` w `layouts/` i zarejestruj go w `interceptors/default.ts`.

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

## System tłumaczeń (i18n)

1. **Struktura plików.** Każdy moduł trzyma swoje frazy w `app/modules/<vendor>/<module>/i18n/<lang>.json` (ścieżka względem katalogu `frontend`). Globalne override’y umieszczaj w `app/i18n/<lang>.json` – mają wyższy priorytet.
2. **Budowanie paczek.** Polecenie `npm run build:i18n` skanuje aktywne moduły, scala ich paczki z override’ami i zapisuje wynik do `dist/i18n/<lang>.json`. SSR wczytuje gotowe pliki i przekazuje je do `I18nProvider`, więc pamiętaj, by odpalić build po każdej zmianie kluczy.
3. **Użycie w kodzie.** Komponenty korzystają z `useI18n()` i funkcji `t(key, params?)`. Dostępne są placeholdery nazwane (`:name`) i pozycyjne (`%1`). Nie interpoluj tekstów ręcznie.
4. **Konwencje.** Dodając nowy klucz, dopisz co najmniej wariant `en_US` i `pl_PL`. Gdy moduł wymaga tłumaczeń, trzymaj je razem z kodem modułu – nie twórz kopii w głównym repo.

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
