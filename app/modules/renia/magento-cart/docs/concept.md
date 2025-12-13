# Koncepcja: renia-magento-cart

Cel: funkcjonalność koszyka (widget, strona koszyka) z możliwością wstrzyknięcia do slotów i tras modułowych.

Składniki:
- Komponenty: `CartWidget` (podsumowanie koszyka), `CartControlLink`, `CartPage` (strona koszyka), akcje produktowe (`AddToCartButton`, `ProductAddToCartPanel`).
- Trasa: `/cart` w `routes.ts` (`componentPath`), `priority` wysoki (100), layout domyślnie `1column`.
- Sloty: interceptor `interceptors/default.ts` dodaje link koszyka do `control-menu` z `id` do deduplikacji.

Zależności:
- Deklarowane w `registration.js`: `renia-interceptors`, `renia-layout`.
- Stan koszyka: `renia-module-cart` (browserStorage TTL 1 h).
- Identyfikator koszyka: `cartIdStorage` (TTL 7 dni, zapis w `browserStorage` albo pamięć in-memory na SSR).

Konwencje:
- Używaj `componentPath` w rejestrach (serializowalność).
- Sloty dodawaj przez interceptor; nadpisanie/wyłączenie możliwe przez `id` + `enabled:false`.
