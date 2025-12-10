# Instrukcje dla agentów

1. Odpowiadaj po polsku i zwięźle.
2. Nie cofaj ani nie nadpisuj istniejących zmian użytkownika; unikaj destrukcyjnych komend typu `git reset --hard`.
3. Do wyszukiwania plików lub tekstu używaj `rg` / `rg --files`, a zmiany w pojedynczych plikach wprowadzaj przez `apply_patch`, gdy to możliwe.
4. Przy większych zadaniach przedstaw krótki plan (bez jednoetapowych planów) i aktualizuj go po każdym kroku.
5. Uruchamiaj dostępne testy lub komendy walidujące; jeśli nie można ich uruchomić, jasno to zaznacz w odpowiedzi.
6. W katalogu `frontend` znajduje się aplikacja frontowa oparta na React z SSR — trzymaj się istniejącej struktury i konwencji projektu.
7. Do pracy lokalnej używaj `npm` (npm install); w dev uruchamiaj równolegle `npm run dev:client` (watch bundla do `dist/public`) i `npm run dev:server` (SSR na porcie 3000).
8. Build produkcyjny: `npm run build`, a następnie `node dist/server/index.js` — serwer podaje statyki z `/static` (`dist/public`).
9. Pliki serwera z JSX trzymaj z rozszerzeniem `.tsx`; ścieżki do statyków pozostaw zgodne z obecnym układem (`dist/public`, endpoint `/static`).
10. W katalogu `frontend/modules` będą moduły/pluginy ładowane tak jak pakiety z `node_modules` — traktuj je jak lokalne zależności projektu.
11. Rozwiązywanie modułów z `frontend/modules` działa dzięki pluginowi esbuild i `NODE_PATH=./modules`; przy nowych importach z modułów używaj standardowych nazw pakietów (bare specifiers).
12. Przykładowy moduł `modules/renia-magento-cart` eksportuje m.in. `CartWidget`, `calculateTotals`, `formatMoney`; importuj go bare specifierem `renia-magento-cart` i dodawaj nowe moduły w podobnej konwencji (własny `package.json`, entry).
13. Jeśli moduł zawiera JSX, zapisuj pliki jako `.tsx` (plugin obsługuje rozszerzenia `.tsx`/`.ts`/`.js` przy wyborze entry z `package.json`).
14. Nie programuj na własną rękę funkcjonalności, o które nie poprosił użytkownik — skupiaj się na realizacji konkretnych, zadanych celów.
15. Moduł rejestru `renia-module-registry` (w `modules/`) wykrywa pakiety z `modules` i `node_modules`, zwraca ścieżki, zależności i statusy; statusy domyślnie pochodzą z `app/etc/config.json` (brak wpisu = wyłączony), opcjonalnie z mapy przekazanej w opcjach.
16. Moduł `renia-router` korzysta z `renia-module-registry` i wczytuje trasy z plików `routes.ts`/`routes.js` w modułach; trasy są sortowane po `priority` i deduplikowane.
17. Moduł `renia-layout` buduje rejestr slotów z plików `layout.ts/.js/.json` modułów (sortuje po `priority`); ma wbudowany layout `1column` z gniazdami m.in. `control-menu`.
18. Moduł `renia-interceptors` (narzędziowy) potrafi uruchamiać pliki `interceptors/default.*` i `interceptors/<kontekst>.*` z aktywnych modułów; to wstrzykiwanie logiki zależne od kontekstu trasy/strony.
19. Tworzenie stron/routingu: każda strona pochodzi z modułu (`modules/<nazwa>/pages/...`), a rejestr tras jest w `routes.ts` z polami `path`, `componentPath` (np. `mod/pages/Page`), opcjonalnie `layout` (np. `1column`, `2column-left`), `priority`. Rejestr musi być serializowalny – używaj `componentPath`, nie eksportów funkcji.
20. Layouty: layout wybierany z meta trasy (`layout` w `routes.ts`), renderuje sloty `header/footer/control-menu/...`; sloty wypełniane przez interceptory lub pliki layoutów modułów. Slot entry może mieć `id`, `priority`, `componentPath`, `enabled` (false wyłącza wpis; wpis z tym samym `id` nadpisuje poprzedni).
21. Interceptory: pliki `interceptors/default.*` (globalnie) i `interceptors/<kontekst>.*` (np. `control-menu`) – loader wywoływany w SSR/kliencie. Interceptor dostaje API `slots.add({ slot, componentPath, id?, priority?, enabled? })`; moduły mogą wstrzykiwać lub wyłączać elementy slotów przez `enabled: false` na tym samym `id`.
22. Rejestracja modułu: dodaj `registration.js` z `name`, `version`, `type`, `dependencies` (nazwy innych modułów). Walidacja zależności dotyczy tylko modułów z rejestracją; brak modułu-dependencji wyłącza moduł. Zależności na zewnętrzne paczki nie blokują startu.
23. Status modułu: sterowany w `app/etc/config.json` (`modules.<nazwa> = 1/0`), brak wpisu = wyłączony.
24. Moduł `renia-graphql-client`: builder (`QueryBuilder`) do zapytań/mutacji GraphQL (fields/fragments/usuwanie pól), serializacja do stringa/obiektów, oraz `executeRequest(request)` (payload string/builder/obiekt, auth bearer/basic/header, timeout domyślnie 5s, błędy timeout/401/403 → wyjątek). Nie podmieniaj transportu; używaj wbudowanego `fetch`.
25. Pisz kod w jak najlepszej jakości, zgodnie z dobrymi praktykami; priorytetem są wydajność, stabilność i czytelność (unikaj “quick fixów” i długów technicznych).
26. Moduły mają być niezależne: nie dokładaj na sztywno elementów modułu A do B bez zdefiniowanych zależności w `registration.js`. Jeśli potrzebujesz wpływać na inny moduł, używaj interceptorów jako warstwy rozszerzeń.
27. Sloty: nie twórz zagnieżdżonych slotów; utrzymuj osobne sloty (`header`, `control-menu`, `content` itd.) i renderuj je w layoucie. Wypełnienia dodawaj przez interceptory na konkretny slot; layout decyduje, gdzie slot jest osadzony.
28. Moduł `renia-magento-category` – menu kategorii musi być pobierane dynamicznie z Magento przez `fetchMenu`. Serwer SSR wstępnie pobiera menu (omija CORS) i przekazuje je w `config.preloadedCategoryMenu`; komponent menu korzysta z tego, zanim zrobi call z przeglądarki. Wymagane zmienne `.env`: `MAGENTO_GRAPHQL_ENDPOINT`, opcjonalnie `MAGENTO_STORE_CODE`, `MAGENTO_ROOT_CATEGORY_ID` (root kategorii). Brak danych = komunikat, nie dodawaj statycznych fallbacków.
29. Header ma dwa poziomy: górny pasek z nawigacją i slotami kontrolnymi oraz dolną strefę `header__menu` z głównym menu kategorii; nie łącz tych slotów ani nie wprowadzaj zagnieżdżonych slotów w headerze.
30. Proxy do Magento: dostępne pod `/api/magento/graphql` (lub `MAGENTO_PROXY_ENDPOINT`), przekazuje zapytania do `MAGENTO_GRAPHQL_ENDPOINT`, dodaje `store` i opcjonalny `MAGENTO_HOST_HEADER`. Jeśli Magento wymaga konkretnego Host, ustaw `MAGENTO_HOST_HEADER`; ustaw endpoint na host osiągalny z kontenera (np. nazwa serwisu dockerowego zamiast domeny z /etc/hosts).
