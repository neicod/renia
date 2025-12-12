# Koncepcja: renia-magento-catalog

Cel: moduł katalogu odpowiedzialny za listę produktów na stronach kategorii, bazując na Magento (GraphQL). Wykorzystuje ID/slug kategorii z `renia-magento-category`, a dane produktowe opiera na kontrakcie `magento-product`.

Zakres do zaimplementowania:
- Listing produktów dla strony kategorii (SSR + CSR) na podstawie identyfikatora kategorii:
  - API: `fetchCategoryProducts({ categoryId|urlPath, page, pageSize, sort, filters, storeCode })`.
  - Wykorzystuje `renia-graphql-client` do budowy i wykonania zapytań (QueryBuilder lub string).
  - Wspiera paginację (page/pageSize), sortowanie i proste filtry atrybutów.
- Integracja z layoutem/slotem `content`:
  - Moduł nie dodaje tras kategorii (należą do `renia-magento-category`). Wstrzykuje `CategoryProductList` przez interceptor `category` do slotu `content`, dzięki czemu zachowuje niezależność modułów.
  - Obsługa stanów: loading, error, empty.
- Współpraca z modułami:
  - `renia-magento-category`: dostarcza dane o kategorii/slug; listing powinien przyjmować `categoryId` lub `url_key/url_path`.
  - `magento-product`: definiuje model/typy produktu i ewentualne helpery prezentacyjne.
- Konfiguracja:
  - Endpoint: korzysta z proxy `/api/magento/graphql` (domyślnie) lub `MAGENTO_GRAPHQL_ENDPOINT`.
  - Store code/auth/nagłówki przez opcje/`beforeSend` z `renia-graphql-client`.
- Dalsze rozszerzenia:
  - Cache w pamięci (opcjonalnie) z kluczem `categoryId+page+sort+filters+store`.
  - Personalizacja sort/filter poprzez parametry URL (opcjonalnie).
  - Sloty rozszerzeń (np. interceptor dla wpięcia badge/promo do listingu).

Zależności do zdefiniowania po wyborze konkretnych integracji (np. `renia-graphql-client`, `renia-layout`).
