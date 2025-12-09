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
