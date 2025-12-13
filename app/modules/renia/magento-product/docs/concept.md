# Koncepcja: magento-product

Cel: moduł obsługujący dane i prezentację produktu Magento (GraphQL). Dostarcza:
- repozytorium produktów (`getList`, `getByUrlKey`) zbudowane na `QueryBuilder`,
- komponenty prezentacyjne (`ProductList`, `ProductTile`, `ProductPage`),
- sloty rozszerzeń dla listingu i karty produktu.

Składniki:
- **Repozytorium:** `services/productRepository.ts` korzysta z helperów `productSearchRequest.ts`/`productSearchResponse.ts` i wystawia tylko `getList` oraz `getByUrlKey`. Wszystkie inne operacje (mapowanie, filtrowanie) zostały wydzielone, by repo było serwisem (bez `new`/singletonów).
- **Komponenty:** `ProductList` renderuje siatkę (`.product-grid`) z obsługą stanów empty/error/loading; `ProductTile` pokazuje miniaturę, cenę i CTA (korzysta z tłumaczeń `product.*`). `ProductPage` (PDP) używa tych samych typów i slotów `product-view-actions`.
- **Sloty:** `ProductTile` publikuje `product-listing-actions`, a `ProductDetails` `product-view-actions`, co pozwala innym modułom (np. koszykowi) wstrzykiwać swoje akcje przez `api.subslots.add`.
- **i18n:** moduł zawiera `i18n/en_US.json` i `i18n/pl_PL.json`; wszystkie teksty użytkownika przechodzą przez `useI18n()`.

Integracje:
- Listing kategorii (`renia-magento-catalog`) i wyszukiwarka (`renia-magento-catalog-search`) przekazują wyniki do `ProductList`.
- Sloty `product-listing-actions`/`product-view-actions` są wykorzystywane m.in. przez `renia-magento-cart`.
- Endpoint GraphQL i nagłówki są obsługiwane przez `renia-magento-graphql-client` + augmentery.

Konwencje:
- Nie rozszerzaj repozytorium o nowe metody – dodawaj helpery obok (`services/*`).
- Jeżeli potrzebujesz dodatkowych pól w zapytaniu, użyj augmentera QueryBuildera (`registerGraphQLQueryAugmenter`) i sprawdź `ctx.operationId`.
- Dodając nowe stringi, pamiętaj o wpisach w `i18n/en_US.json` i `i18n/pl_PL.json`.
