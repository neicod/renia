# Koncepcja: renia-magento-wishlist

Cel: niezależna lista życzeń działająca wyłącznie po stronie klienta. Moduł nie polega na funkcjonalności Magento – jedynie pobiera dane produktów (te same, które są używane na listingu / PDP) i przechowuje je lokalnie. Dzięki temu wishlistę można obsługiwać bez logowania i bez SSR.

## Założenia funkcjonalne
1. **Przechowywanie danych** – wpisy (ID produktu, SKU, snapshot danych produktowych) trzymamy w `browserStorage` (warstwa abstrakcji nad `localStorage`). Każdy rekord ma `updatedAt`; TTL = 24h. Po upływie TTL rekord nie jest natychmiast usuwany – jest oznaczony jako wymagający odświeżenia.
2. **Odświeżanie po 24h** – gdy użytkownik odwiedzi stronę wishlisty i mamy wpisy starsze niż 24h, moduł wywołuje zapytanie do Magento, żeby pobrać aktualne dane (nazwa, cena, dostępność). Dane są nadpisywane w storage w całości.
3. **Sloty/UI** – moduł wstrzykuje ikonę serca obok przycisków „Dodaj do koszyka” na listingu (`product-listing-actions`) i na karcie produktu (`product-view-actions`). Ikona działa jako toggle: dodaje lub usuwa produkt z listy.
4. **Stan ikony** – na listingu i PDP przekazujemy do komponentu wszystkie dane o produkcie (z `magento-product`). Komponent wishlisy bazuje na tych danych i na stanie storage; jeśli SKU znajduje się w wishliście, ikona jest wypełniona.
5. **Brak SSR** – komponenty wishlisty renderują się tylko w przeglądarce (używają `useEffect`, `browserStorage`, `window`). SSR nie wykonuje żadnych akcji ani zapytań.

## Architektura
- `services/wishlistStore.ts` – proste API CRUD oparte o `browserStorage`, z TTL i subskrypcjami (publish/subscribe) do powiadamiania komponentów UI o zmianach.
- `services/wishlistSync.ts` – logika odświeżania produktów (wywołuje repo `magento-product.getList` z listą SKU, nadpisuje wpisy w storage).
- `components/WishlistHeart.tsx` – ikona serca; przyjmuje `product` (kontrakt z `magento-product`) i `variant` (`listing` / `pdp`) w celu stylowania.
- `components/WishlistPage.tsx` – lista produktów z wishlisty, używa `wishlistStore` + `wishlistSync` gdy TTL minął.
- `interceptors/category.ts` i `interceptors/product.ts` – dodają `WishlistHeart` odpowiednio do slotów `product-listing-actions` i `product-view-actions`. Interceptor `default.ts` może dodać link „Wishlist” do `control-menu`, jeśli potrzebujemy szybkiej nawigacji.

## Integracja z innymi modułami
- Brak bezpośredniej ingerencji w kod innych modułów – ekspozycja wyłącznie przez sloty i rejestr komponentów.
- Listing/karta produktu nie wykonują dodatkowych zapytań o produkt – `WishlistHeart` korzysta z props `product`, które już są dostępne.
- Zapytania o produkty (przy odświeżaniu listy) używają istniejącego repozytorium `magento-product` (`getList` po SKU lub `urlKey`).

## Zgodność z SOLID
- Store (zarządzanie danymi) jest oddzielony od komponentów UI i od warstwy synchronizacji z Magento.
- Interfejsy (np. `WishlistStorage`, `WishlistSync`) pozwalają na testowanie i potencjalną wymianę implementacji bez zmian w komponentach.
- Wszystkie zależności do innych modułów wprowadzamy przez importy i sloty/interceptory – żadnych modyfikacji kodu źródłowego innych modułów.

## Notatki implementacyjne
- W storage zapisujemy minimalny snapshot (`sku`, `name`, `thumbnail`, `price`, `updatedAt`). Więcej pól można dodać w przyszłości.
- Odświeżanie 24h można wyzwolić również na innych widokach (np. klik w ikonę), ale minimalny wymóg to strona wishlisty.
- Pamiętaj o tłumaczeniach (`i18n/en_US.json`, `i18n/pl_PL.json`) – wszystkie teksty UI i toasty powinny korzystać z `useI18n`.
