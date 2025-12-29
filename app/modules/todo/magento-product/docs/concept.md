# Koncepcja: magento-product

Cel: moduł obsługujący dane i prezentację produktu Magento (GraphQL). Dostarcza:
- repozytorium produktów (`getList`) zbudowane na `QueryBuilder`,
- komponenty prezentacyjne (`ProductList`, `ProductTile`, `ProductPage`),
- rozszerzalne “outlety” w host komponentach (listing/PDP).

Składniki:
- **Repozytorium:** `services/productRepository.ts` korzysta z helperów `productSearchRequest.ts`/`productSearchResponse.ts` i wystawia tylko `getList`. Wszystkie inne operacje (mapowanie, filtrowanie) zostały wydzielone, by repo było serwisem (bez `new`/singletonów).
- **Komponenty:** `ProductList` renderuje siatkę (`.product-grid`) z obsługą stanów empty/error/loading; `ProductTile` pokazuje miniaturę, cenę i CTA (korzysta z tłumaczeń `product.*`). `ProductPage` (PDP) używa tych samych typów i outletów akcji (PDP actions).
- **Outlety rozszerzeń:** hosty renderują `ExtensionsOutlet`:
  - `ProductTile` host: `renia-magento-product/components/ProductTile` (outlet: `actions`)
  - `ProductDetails` host: `renia-magento-product/pages/components/ProductDetails` (outlet: `actions`)
  Inne moduły (np. koszyk, wishlist) dopinają UI przez `api.extend.component(host).outlet('actions').add(...)`.
- **i18n:** moduł zawiera `i18n/en_US.json` i `i18n/pl_PL.json`; wszystkie teksty użytkownika przechodzą przez `useI18n()`.

Integracje:
- Listing kategorii (`renia-magento-catalog`) i wyszukiwarka (`renia-magento-catalog-search`) przekazują wyniki do `ProductList`.
- Outlety `ProductTile#actions` / `ProductDetails#actions` są wykorzystywane m.in. przez `renia-magento-cart` i `renia-magento-wishlist`.
- Endpoint GraphQL i nagłówki są obsługiwane przez `renia-magento-graphql-client` + augmentery.
- Moduł zakłada dostępność frameworka jako paczki `@renia/*` (alias na `app/modules/renia/framework` w projekcie głównym).

Konwencje:
- Nie rozszerzaj repozytorium o nowe metody – dodawaj helpery obok (`services/*`).
- Jeżeli potrzebujesz dodatkowych pól w zapytaniu, użyj augmentera QueryBuildera (`registerGraphQLQueryAugmenter`) i sprawdź `ctx.operationId`.
- Dodając nowe stringi, pamiętaj o wpisach w `i18n/en_US.json` i `i18n/pl_PL.json`.
