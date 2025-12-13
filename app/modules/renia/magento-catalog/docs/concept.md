# Koncepcja: renia-magento-catalog

Cel: moduł katalogu odpowiedzialny za listing produktów na stronach kategorii (SSR + CSR). Korzysta z identyfikatora kategorii przekazywanego przez `renia-magento-category` i z modeli `magento-product`.

Składniki:
- **Hook `useCategoryProductList`.** Zarządza stanem listingu (produkty, paginacja, sortowanie, pageSize). Wspiera SSR (`initialListing` z meta trasy) oraz lazy fetch na kliencie.
- **`CategoryProductList`.** Wrapper renderujący nagłówek (tytuł kategorii), toolbar (`ProductListingToolbar`), siatkę (`ProductList`) i paginację (`ProductListingPagination`). Komponent korzysta z hooka i tłumaczeń `catalog.*`.
- **Provider konfiguracji.** `services/storefrontConfig.ts` czyta `grid_per_page` i `grid_per_page_values` z `storeConfig.raw` (augmenter dodaje pola do zapytania) i udostępnia wartości hookom.
- **Interceptory.** Plik `interceptors/category.ts` wstrzykuje `CategoryProductList` do slotu `content` tylko na trasach typu `category`. SSR przekazuje `initialListing` przez meta slotu, aby uniknąć migania przy pierwszym renderze.

Integracje:
- `renia-magento-category` dostarcza `category` w meta (UID, label, path), a route handler ustawia `requiresCategoryPath`.
- Komponent `ProductList` pochodzi z `magento-product`; slot `product-listing-actions` pozwala innym modułom dodawać CTA, np. koszyk.
- Hook `useStorefrontPageSizeConfig` korzysta z `renia-magento-store` (augmenter `storeConfig`) i fallbacku GraphQL `StorefrontPageSizeConfig`.

Konwencje:
- WSZYSTKIE zapytania GraphQL budujemy na `QueryBuilder` (patrz `services/queries.ts`), `operationId` = `magentoCatalog.categoryProducts`.
- SSR przekazuje `initialListing` tylko, jeśli w meta trasie są dane kategorii – nie wykonuj dodatkowych zapytań, dopóki hook nie otrzyma UID.
- Tłumaczenia UI (`catalog.listing.*`, `catalog.pagination.*`) trzymane są w `i18n/<lang>.json` i wymagają `npm run build:i18n` po zmianach.
