# Koncepcja: renia-magento-cart

Cel: funkcjonalność koszyka (widget, strona koszyka) z możliwością wstrzyknięcia do slotów i tras modułowych.

Składniki:
- Komponenty: `CartWidget` (podsumowanie koszyka), `CartControlLink`, `CartPage` (strona koszyka), akcje produktowe (`AddToCartButton`, `ProductAddToCartPanel`).
- Trasa: `/cart` w `routes.ts` (`componentPath`), `priority` wysoki (100), layout domyślnie `1column`.
- Regiony layoutu: interceptor `interceptors/default.ts` dodaje link koszyka do `control-menu` z `id` do deduplikacji.

Stan/storage:
- `CartManagerProvider` + `useCartManager()` owija operacje na koszyku (`addProduct`, `updateItemQuantity`, `removeItem`). Provider pozwala łatwo podmienić manager w testach.
- Źródłem prawdy jest `renia-module-cart` (cache w `browserStorage`, TTL 1 h) oraz `cartIdStorage` (TTL 7 dni). Po każdej operacji store jest synchronizowany i publikowany przez `subscribeToCartQuantity`.
- Moduł nigdy nie korzysta bezpośrednio z `localStorage`; całą komunikację obsługuje `browserStorage`.

Prezentacja:
- Komponenty korzystają z `useI18n()` (`cart.action.*`, `cart.toast.*`, `cart.form.*`) i `useToast()` (`renia-ui-toast`) do informowania o zmianach w koszyku.
- UI dodawania do koszyka jest renderowane jako component extension w outlecie `actions` hostów (`ProductTile` i `ProductDetails`); SSR nie renderuje wrażliwej liczby sztuk.

Zależności:
- Stan koszyka: `renia-module-cart` (browserStorage TTL 1 h).
- Identyfikator koszyka: `cartIdStorage` (TTL 7 dni, zapis w `browserStorage` albo pamięć in-memory na SSR).

Konwencje:
- Używaj `componentPath` w rejestrach (serializowalność).
- Regiony layoutu dodawaj przez interceptor; nadpisanie/wyłączenie możliwe przez `id` + `enabled:false`.
