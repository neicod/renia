# Koncepcja: renia-magento-wishlist

Cel: lekka wishlisty działająca wyłącznie po stronie klienta. Dane o produktach przechowujemy w `browserStorage` jako snapshot (TTL 24h). Magento służy jedynie do okazjonalnego odświeżenia informacji o produktach – przy wejściu na stronę wishlisty odczytujemy zapisane SKU i pobieramy aktualny zestaw danych, nadpisując lokalny cache.

## Składniki
- **Storage + store** – `wishlistStorage` (serializacja do `browserStorage`, TTL) oraz `wishlistStore` (event emitter, metody `toggle`, `remove`, `refreshFromProducts`). Brak bezpośrednich odwołań do `localStorage` – korzystamy z centralnej warstwy storage.
- **Synchronizacja** – `wishlistSync` sprawdza, czy istnieją wpisy starsze niż 24h i, jeśli użytkownik odwiedza wishlistę, wywołuje zapytanie `magento-product.getList` z filtrem `sku in [...]`, a następnie aktualizuje snapshoty.
- **Hooki** – `useWishlist()` (stan + akcje) i `useIsClient()` (blokada SSR).
- **Komponenty**:
  - `WishlistControlLink` – link w menu (slot `control-menu`), wyświetla licznik pozycji (tylko po stronie klienta).
  - `WishlistHeart` – ikona serca wpinana do slotów `product-listing-actions` i `product-view-actions`. Na SSR komponent zwraca `null`, UI pojawia się dopiero w kliencie.
  - `WishlistPage` – lista produktów z możliwością ręcznego odświeżenia oraz usunięcia pozycji.

## Integracje
- **Sloty/interceptory** – `interceptors/default.ts` dodaje link w `control-menu`, `interceptors/category.ts` i `product.ts` doklejają serca do slotów listingu i PDP. Żadnej bezpośredniej ingerencji w kod innych modułów.
- **Dane produktu** – serce otrzymuje komplet danych w `props.product` (przekazany przez moduł `magento-product`). Dzięki temu kliknięcia nie wymagają dodatkowych zapytań.
- **i18n** – wszystkie teksty (`wishlist.*`) znajdują się w `i18n/en_US.json` / `pl_PL.json` i są ładowane przez `npm run build:i18n`.

## Zasady
- Moduł działa wyłącznie w przeglądarce – komponenty UI sprawdzają `useIsClient()`.
- TTL = 24h. Po upłynięciu czasu wpisy nie są kasowane – przy wejściu na `/wishlist` wykonujemy odświeżenie (nadpisujemy dane).
- Kod trzyma się SOLID – warstwa storage, store i UI są oddzielone; logika synchronizacji z Magento siedzi w osobnym serwisie.
