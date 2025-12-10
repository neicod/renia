# Koncepcja: magento-wishlist

Cel: funkcjonalność wishlisty (strona, link w menu) osadzana modułowo.

Składniki:
- Komponenty: `WishlistControlLink` (link do wishlisty), `WishlistPage` (strona wishlisty).
- Trasa: `/wishlist` w `routes.ts` (`componentPath`), `priority` 80, layout domyślnie `1column`.
- Sloty: interceptor `interceptors/default.ts` dodaje link do `control-menu` (globalnie) z `id` `wishlist-link`.

Zależności:
- Deklarowane w `registration.js`: `renia-router`, `renia-interceptors`, `renia-layout`.

Konwencje:
- Rejestry używają `componentPath` dla serializowalności.
- Sloty przez interceptor, deduplikacja po `id`, możliwość wyłączenia przez `enabled:false`.
