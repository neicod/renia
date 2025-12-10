# Koncepcja: renia-magento-cart

Cel: funkcjonalność koszyka (widget, strona koszyka) z możliwością wstrzyknięcia do slotów i tras modułowych.

Składniki:
- Komponenty: `CartWidget` (podsumowanie koszyka), `CartControlLink`, `CartPage` (strona koszyka).
- Trasa: `/cart` w `routes.ts` (`componentPath`), `priority` wysoki (100), layout domyślnie `1column`.
- Sloty: interceptor `interceptors/default.ts` dodaje link koszyka do `control-menu` z `id` do deduplikacji.

Zależności:
- Deklarowane w `registration.js`: `renia-router`, `renia-interceptors`, `renia-layout`.

Konwencje:
- Używaj `componentPath` w rejestrach (serializowalność).
- Sloty dodawaj przez interceptor; nadpisanie/wyłączenie możliwe przez `id` + `enabled:false`.
