# Koncepcja: renia-magento-category

Cel: moduł kategorii oparty na Magento GraphQL. Dostarcza stronę kategorii, komponenty menu kategorii oraz serwis do pobierania menu (z możliwością modyfikacji requestu przed wysłaniem).

## Zależności
- `renia-layout` – sloty/układ (np. header/control-menu/content).
- `renia-graphql-client` – builder i wykonanie zapytań GraphQL.
- `renia-menu` – kontrakt struktury menu (MenuItem/MenuTree).

## Strony i routing
- Trasa: `/category/:slug` (`componentPath: 'renia-magento-category/pages/CategoryPage'`), layout domyślnie `1column`.
- `CategoryPage` pobiera `slug` z routera i renderuje zawartość kategorii (placeholder; do rozszerzenia o dane z API).
- Rejestr tras w `routes.ts` (serializowalne pola: `path`, `componentPath`, `layout?`, `priority?`).

## Sloty / Menu
- `CategoryMainMenu` (statyczne/dynamiczne) wstrzykiwane do slotu `header` przez interceptor `interceptors/default.ts`.
- Sloty są niezależne – layout decyduje, gdzie renderuje `header/control-menu/...`.
- Wpis slotu może mieć `id`, `priority`, `componentPath`, `enabled` (false wyłącza/ nadpisuje przy tym samym `id`).

## Serwis menu (do wdrożenia)
- API: `fetchMenu(options)` → zwraca ujednolicone drzewo menu (`MenuItem[]` z `renia-menu`).
- Budowa requestu:
  - `payload`: zapytanie GraphQL jako `QueryBuilder` (domyślnie `categoryList(filters: $filters)` z polami `uid/name/url_path/include_in_menu/position/children`, zagnieżdżenie kontrolowane parametrem `depth` – domyślnie 2).
  - `endpoint` (wymagany), `variables`, `headers` (np. `store`), `auth` (bearer/basic/header), `timeoutMs`.
  - Domyślne zmienne: `filters` z `parent_id = 2` (traktowane jako root kategorii) – docelowo należy pobrać ten identyfikator z konfiguracji Magento zamiast stałej.
- Hooki przed wysłaniem:
  - Lista middleware `(req, ctx) => req|void`, wywoływana w kolejności; pozwala dodać/zmodyfikować nagłówki, auth, zmienne, logikę; zwracany `req` nadpisuje poprzedni. `ctx` zawiera string zapytania (`query`).
  - Błąd w hooku przerywa wysyłkę (wyjątek).
- Obsługa błędów: timeout (domyślnie 5s) → wyjątek; 401/403 → wyjątek; obecność `errors` w odpowiedzi GraphQL → wyjątek.
- Mapper: filtruje `include_in_menu === false`, mapuje do `MenuItem { id, label, url, children, position?, includeInMenu?, type: 'category' }`. Brak `url_path` → `#`.
- Hooki mogą zmieniać `storeCode`, auth, zmienne (np. `depth`), dodawać logowanie/A/B; brak hooka = wysyłka bazowa.
- SSR prefetch: serwer (jeśli `MAGENTO_GRAPHQL_ENDPOINT` jest ustawiony) wstępnie pobiera menu i przekazuje je w `config.preloadedCategoryMenu` do bootstrapa, co omija problemy CORS. `CategoryMainMenu` najpierw używa preładowanych danych, a dopiero potem (w razie braku) wywołuje `fetchMenu` w przeglądarce. Env wspiera `MAGENTO_STORE_CODE`, `MAGENTO_ROOT_CATEGORY_ID`.
- Proxy: Express udostępnia `/api/magento/graphql` (ustawiane przez `MAGENTO_PROXY_ENDPOINT` albo domyślnie ten path), które przekazuje zapytania do `MAGENTO_GRAPHQL_ENDPOINT` i dokleja nagłówek `store` (jeśli dostępny). `CategoryMainMenu` preferuje proxy przed bezpośrednim endpointem Magento, co eliminuje problemy DNS/CORS w przeglądarce.
- Obsługa hosta: jeśli Magento wymaga konkretnego Host header, ustaw `MAGENTO_HOST_HEADER`; proxy i preload dodadzą go do zapytania.

## Komponenty / eksporty
- `CategoryPage` (strona kategorii).
- `CategoryMainMenu` (menu kategorii do slotu header).
- Przyszłe: serwis `fetchMenu`/helpery mapujące odpowiedź Magento na strukturę menu.

## Konwencje implementacyjne
- Korzystaj z `componentPath`/serializowalnych danych w rejestrach (trasy/sloty).
- Nie wiąż modułu na sztywno z innymi bez deklaracji w `registration.js` (zależności).
- Sloty wstrzykuj interceptorami; layout decyduje o rozmieszczeniu.
- Strona kategorii `/category/:slug`: docelowo pobiera dane kategorii przez serwis GQL (placeholder do rozbudowy: breadcrumb, lista produktów, filtracja). 
- Interceptor menu powinien docelowo pobierać menu dynamicznie (`fetchMenu`) i wstrzykiwać do slotu `header`.
