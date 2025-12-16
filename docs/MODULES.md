# Moduły aplikacji

Tabela opisuje aktywne moduły. Moduły mogą znajdować się w `app/modules/<vendor>/<module>` (zalecane) lub w historycznym `modules/`. Każdy ma własny `package.json`, może dostarczać komponenty React, interceptory, trasy, usługi itd.

> **Uwaga:** moduły są aktywowane przez wpis w `app/etc/config.json` (`modules.<nazwa> = 1`). Brak wpisu = moduł wyłączony.
> Moduły możesz trzymać zarówno w `modules/`, jak i w `app/modules/<vendor>/<module>` – w tym drugim przypadku pamiętaj, by dodać zależność `npm install <nazwa>@file:app/modules/<vendor>/<module>`, aby importy działały jak dla standardowej paczki npm.

## Spis modułów

| Moduł | Główna odpowiedzialność | Najważniejsze pliki / punkty wejścia | Notatki |
|-------|-------------------------|--------------------------------------|---------|
| `renia-graphql-client` | Generyczna obsługa GraphQL (builder, fetch, auth, logowanie). | `services/builder.ts`, `request.ts`, `types.ts`. | Nie zmieniaj transportu – cała komunikacja idzie przez `fetch`. |
| `renia-magento-graphql-client` | Fabryka requestów do Magento, rozwiązuje endpoint (direct/proxy) i dba o format. | `requestFactory.ts`, `utils/magentoEndpoint.ts`. | Przy tworzeniu requestu ustaw `operationId`, by augmentery mogły reagować. |
| `renia-magento-store` | Pobieranie i cache konfiguracji sklepu (`storeConfig`), rejestr nagłówka `store`. | `services/storeConfig.ts`, `services/storeHeaders.ts`, `index.ts`. | `getStoreConfig()` cache’uje wynik i udostępnia `store` w `AppEnvironment`. |
| `magento-product` | Encja produktu i repozytorium (tylko `getList` oraz `getByUrlKey`). | `services/productRepository.ts`, `services/productSearchRequest.ts`, `services/product.ts`, `services/productSearchResponse.ts`. | Udostępnia sloty `product-listing-actions` i `product-view-actions` (renderowane przez `ProductTile` i `ProductDetails`), zapytania bazują na `QueryBuilder`, komponenty mają wbudowane tłumaczenia (`i18n/product.*`). |
| `renia-magento-catalog` | Listing produktów na stronach kategorii. | `components/CategoryProductList.tsx`, `hooks/useProductListing.ts`, `services/categoryProducts.ts`, `services/categoryUid.ts`, `services/queries.ts`, `services/storefrontConfig.ts`. | Interceptor `category` wstrzykuje komponent do slotu `page.content` poprzez `api.layout.get('content').add(...)`; moduł rejestruje też augmenter, który dodaje `grid_per_page` do zapytania `storeConfig`. |
| `renia-magento-catalog-search` | Wyszukiwarka produktów (UI + logika). | `components/SearchBar.tsx`, `components/SearchProductList.tsx`, `hooks/useSearchProductList.ts`. | Opiera się na `useProductListing`; query budowane jest na `magento-product`. |
| `renia-magento-category` | Dane kategorii i menu. | `components/CategoryMainMenu.tsx`, `services/menu.ts`, `services/categoryRepository.ts`, `services/categoryQueries.ts`. | SSR prefetchuje menu i przekazuje w `bootstrap.config.preloadedCategoryMenu`. |
| `renia-i18n` | Globalny provider tłumaczeń; merges moduły `*/i18n/<lang>.json` z `app/i18n` (priorytet). | `context/I18nProvider.tsx`, `hooks/useI18n.ts`, `services/interpolate.ts`, `scripts/build-i18n.mjs`. | Klucze semantyczne; placeholdery `:name` i `%1`; `build:i18n` generuje `dist/i18n/<lang>.json` używane na SSR/CSR. |
| `renia-magento-cart` | Widget koszyka i link w nagłówku plus akcje koszykowe. | `components/CartControlLink.tsx`, `components/AddToCartButton.tsx`, `components/ProductAddToCartPanel.tsx`, `registerComponents.ts`, `interceptors/*`, `context/CartManagerContext.tsx`. | Interceptor `default` dodaje link do `page.header.control-menu` poprzez hierarchiczny API, a kontekstowe interceptory (`category`, `product`) osadzają przyciski w subslotach `product-listing-actions` i `product-view-actions`. `CartManagerProvider`/`useCartManager` ułatwia mockowanie; identyfikator koszyka trzymany w `cartIdStorage` (TTL 7 dni). Komponenty używają i18n i `renia-ui-toast` do komunikatów. |
| `renia-magento-cart-sidebar` | Wysuwany sidebar koszyka na wszystkich stronach poza `/cart`. | `components/CartSidebar.tsx`, `components/CartLinkSidebar.tsx`, `services/cartSidebarStore.ts`, `interceptors/default.ts`. | Interceptor podmienia komponent w `page.header.control-menu` poprzez API `api.layout.get('page.header.control-menu')`; dane pobiera z cache `renia-module-cart`/`renia-magento-cart`; brak SSR i dodatkowych zapytań, wszystko opiera się na stanie z `browserStorage` (TTL 1 h). |
| `renia-module-cart` | Stan koszyka (store + hook). | `services/cartStore.ts`, `hooks/useCart.ts`, `index.ts`. | Singleton przechowywany globalnie; synchronizację z przeglądarką realizuje `browserStorage` (TTL 1 h) – nigdy nie korzystaj z `localStorage` bezpośrednio. |
| `renia-ui-toast` | Centralny system toastów (powiadomień). | `components/ToastViewport.tsx`, `hooks/useToast.ts`, `services/toastStore.ts`, `interceptors/default.ts`. | Interceptor `default` osadza `ToastViewport` w slocie `page.global-overlay` poprzez `api.layout.get('global-overlay').add(...)`; API `useToast()`/`pushToast()` służy do pokazywania komunikatów. |
| `renia-magento-wishlist` | Link do wishlisty + podstawowe komponenty. | `components/WishlistControlLink.tsx`, `registerComponents.ts`, `interceptors/*`. | Dodaje link do `page.header.control-menu` oraz komponenty do subslotów produktu. |
| `renia-layout` | Layout i system slotów. | `components/LayoutShell.tsx`, `registerComponents.ts`, `README.md`. | Layout `1column` używany domyślnie; można dodać własne layouty przez moduły. |
| `renia-interceptors` | Loader interceptorów i API do zarządzania slotami. | `index.ts`, `loader.ts`, `README.md`. | Interceptory są ładowane wg kontekstu (`default`, `control-menu`, `category`, ...). |
| `renia-menu` | Definicje typów menu; współdzielone z modułem kategorii. | `index.ts`. | Lekki moduł typów/kontraktów. |

## Struktura przykładowego modułu

```
modules/<moduł>/
├── package.json          # nazwa pakietu (bare specifier)
├── registration.ts       # metadata modułu, dependencies
├── registerComponents.ts # rejestracja komponentów
├── routes.ts             # (opcjonalnie) dodatkowe trasy
├── layout.ts             # (opcjonalnie) sloty layoutu
├── interceptors/         # (opcjonalnie) interceptory
├── services/             # logika biznesowa / API
├── components/           # komponenty React
└── README.md             # opis modułu
```

## Najważniejsze zależności między modułami

- `renia-magento-catalog` zależy od `magento-product` (repozytorium) oraz `renia-magento-category` (dane o kategorii).
- `renia-magento-store` jest niezależny – używany przez `AppRoot` i hooki (np. page size).
- `renia-layout` i `renia-interceptors` to warstwa infrastruktury – wszystkie moduły korzystają pośrednio przez framework.

## Dodawanie nowego modułu

1. Utwórz katalog w `modules`, dodaj `package.json` z unikalną nazwą (prefiks projektu).
2. Dodaj `registration.ts` z danymi modułu (min. `name`, `version`, opcjonalnie `dependencies`).
3. Zarejestruj komponenty w `registerComponents.ts`.
4. Jeśli moduł ma wpływać na layout/sloty – dodaj `layout.ts` i/lub interceptory.
5. Włącz moduł w `app/etc/config.json` (`modules["twoj-modul"] = 1`).
6. (Opcjonalnie) dodaj dokumentację modułu w `modules/<nazwa>/README.md` i uzupełnij tę tabelę.
