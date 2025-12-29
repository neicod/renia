# Koncepcja: renia-magento-cart-sidebar

Cel: rozszerzenie modułu `renia-magento-cart` o wysuwany sidebar koszyka widoczny na wszystkich podstronach poza `/cart`. Brak SSR – wszystko dzieje się po stronie klienta.

Składniki:
- `components/CartSidebar.tsx` – panel boczny oparty o stan `renia-module-cart` i akcje `renia-magento-cart` (refresh po każdej operacji).
- `components/CartLinkSidebar.tsx` – podmienia domyślny link koszyka (`cart-link` w slocie `control-menu`) tak, aby otwierał sidebar (poza `/cart`).
- `services/cartSidebarStore.ts` – prosty store `isOpen` dla widoczności sidebara.
- `interceptors/default.ts` – wstrzykuje `CartSidebar` do `global-overlay` i podmienia `cart-link` w `control-menu`.

Zależności:
- `renia-magento-cart` (akcje/manager, `cartIdStorage` z TTL 7 dni).
- `renia-module-cart` (stan koszyka; synchronizacja z przeglądarką TTL 1 h w `browserStorage`).

Konwencje:
- Moduł nie wykonuje własnych zapytań GraphQL – wszystkie dane pochodzą z cache `renia-module-cart`/`CartManager`.
- Nie zapisuje niczego bezpośrednio w `localStorage`; korzysta wyłącznie z warstwy storage koszyka.
- Nie renderuje zawartości po stronie serwera – komponenty są klienckie.
- Podmiana `cart-link` ma ten sam `id`, by nie dublować wpisów w slocie.
