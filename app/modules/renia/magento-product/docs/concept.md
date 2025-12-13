# Koncepcja: magento-product

Cel: moduł obsługujący dane i prezentację produktu Magento (GraphQL). Dostarcza kartę produktu (PDP) z własnym routerem oraz komponent listy produktów, który może być osadzany w `content` na stronach kategorii (współpraca z `renia-magento-catalog`).

Zakres (do implementacji):
- Router PDP:
  - Rejestracja trasy produktu (np. `/product/:urlKey` lub `/p/:sku`) w `routes.ts` (`componentPath`, `layout`).
  - Komponent `ProductPage` renderuje szczegóły produktu (tytuł, cena, media, opis; placeholder na start).
- Serwisy produktu:
  - `fetchProduct({ sku|urlKey, fields, variables, beforeSend })` oparte na `renia-graphql-client`.
  - Obsługa stanów: loading/error/brak danych, opcjonalnie cache (TTL) po kluczu SKU/urlKey.
- Komponent listy produktów:
  - `ProductList` renderujący kolekcję produktów (grid/lista), wyświetla podstawowe pola (miniatura, nazwa, cena, CTA).
  - Komponent ma props/kontrakt tak, by `renia-magento-catalog` mógł przekazać wyniki query kategorii lub własne zapytanie (SSR/CSR).
  - Stany: loading/error/empty, opcjonalnie prosty skeleton.
- Typy/model:
  - Wspólny kontrakt `Product`/`Price`/`Media` itp., używany przez listing i PDP.
  - Możliwe rozszerzenia przez interceptor/slot (np. badge, dodatkowe pola).
- Konfiguracja:
  - Endpoint przez proxy `/api/magento/graphql` (domyślnie) lub `MAGENTO_GRAPHQL_ENDPOINT`.
  - Auth/nagłówki przez `beforeSend`/opcje requestu.
- Integracje:
  - Współpraca z `renia-magento-catalog` (listing w kontekście kategorii).
  - Możliwe sloty/interceptory do wzbogacania karty produktu (np. cross-sell, badge).

Zależności: wymaga `renia-graphql-client`; współpracuje z `renia-magento-catalog` (listing) i slotami/layoutem. При wdrażaniu dopisz zależności w `registration.js`.
