# Koncepcja: renia-magento-catalog

Cel: moduł katalogu odpowiedzialny za listing produktów na stronach kategorii (SSR + CSR). Korzysta z identyfikatora kategorii przekazywanego przez `renia-magento-category` i z modeli `magento-product`.

Składniki:
- **Hook `useCategoryProductList`.** Zarządza stanem listingu (produkty, paginacja, sortowanie, pageSize). Wspiera SSR (`initialListing` z meta trasy) oraz lazy fetch na kliencie.
- **`CategoryProductList`.** Wrapper renderujący listing produktów kategorii. Wspólne UI (toolbar/paginacja/layout listingu) jest dostarczane przez moduł `renia-magento-product-listing`.
- **Provider konfiguracji.** Konfiguracja page size (`grid_per_page`, `grid_per_page_values`) jest obsługiwana przez `renia-magento-product-listing`.
- **Interceptory.** Plik `interceptors/category.ts` wstrzykuje `CategoryProductList` do slotu `content` tylko na trasach typu `category`. SSR przekazuje `initialListing` przez meta slotu, aby uniknąć migania przy pierwszym renderze.

Integracje:
- `renia-magento-category` dostarcza `category` w meta (UID, label, path), a route handler ustawia `requiresCategoryPath`.
- Komponent `ProductList` pochodzi z `magento-product`; akcje na kaflu są rozszerzane przez component extensions (`ProductTile` host/outlet `actions`), np. koszyk i wishlist.
- Hook `useStorefrontPageSizeConfig` korzysta z `renia-magento-store` (augmenter `storeConfig`) i fallbacku GraphQL `StorefrontPageSizeConfig`.

Konwencje:
- WSZYSTKIE zapytania GraphQL budujemy na `QueryBuilder` (patrz `services/queries.ts`), `operationId` = `magentoCatalog.categoryProducts`.
- SSR przekazuje `initialListing` tylko, jeśli w meta trasie są dane kategorii – nie wykonuj dodatkowych zapytań, dopóki hook nie otrzyma UID.
- Tłumaczenia UI (`catalog.listing.*`, `catalog.pagination.*`) trzymane są w `i18n/<lang>.json` i wymagają `npm run build:i18n` po zmianach.
