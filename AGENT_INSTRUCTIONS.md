# Instrukcje dla agentów

1. Odpowiadaj po polsku i zwięźle.
1. **[KRYTYCZNE] Modułowe rozszerzenia:** Moduł A nigdy nie modyfikuje kodu modułu B. Rozszerzenia implementuj poprzez interceptory, sloty, augmentacje GraphQL lub publiczne API modułu docelowego. Każdy moduł musi być wyłączalny w `config.json` bez wpływu na działanie innych. Nowa funkcjonalność = nowy moduł, który rozszerza istniejące moduły, nie modyfikuje ich.
1. Zanim zaczniesz, zerknij do `README.md` (przegląd architektury), `docs/MODULES.md` (opis modułów) **oraz `docs/concept.md` w obrębie modułu**, żeby znać jego kontrakty; aktualizuj dokumentację i koncepty, jeśli dokładasz nowe możliwości.
1. Nigdy nie używaj `window.localStorage` bezpośrednio – zawsze korzystaj z serwisu `@framework/storage/browserStorage`, aby centralnie śledzić operacje.
1. Pliki tłumaczeń modułów trzymaj w `app/modules/<vendor>/<module>/i18n/<lang>.json` (wewnątrz katalogu `frontend`). Override’y higher-level trafiają do `app/i18n`. Nie zostawiaj kopii w innych miejscach.
1. Przy zmianach i18n pamiętaj o kroku `npm run build:i18n` (scala `app/modules/*/i18n` z `app/i18n`); klucze tłumaczeń są semantyczne, placeholdery `:name` i `%1`.
1. Nie cofaj ani nie nadpisuj istniejących zmian użytkownika; unikaj destrukcyjnych komend typu `git reset --hard`.
1. Do wyszukiwania plików lub tekstu używaj `rg` / `rg --files`, a zmiany w pojedynczych plikach wprowadzaj przez `apply_patch`, gdy to możliwe.
1. Przy większych zadaniach przedstaw krótki plan (bez jednoetapowych planów) i aktualizuj go po każdym kroku.
1. Uruchamiaj dostępne testy lub komendy walidujące; jeśli nie można ich uruchomić, jasno to zaznacz w odpowiedzi.
1. W katalogu `frontend` znajduje się aplikacja frontowa oparta na React z SSR — trzymaj się istniejącej struktury i konwencji projektu.
1. Do pracy lokalnej używaj `npm` (npm install); w dev uruchamiaj równolegle `npm run dev:client` (watch bundla do `dist/public`) i `npm run dev:server` (SSR na porcie 3000).
1. Build produkcyjny: `npm run build`, a następnie `node dist/server/index.js` — serwer podaje statyki z `/static` (`dist/public`).
1. Pliki serwera z JSX trzymaj z rozszerzeniem `.tsx`; ścieżki do statyków pozostaw zgodne z obecnym układem (`dist/public`, endpoint `/static`).
1. W katalogu `frontend/modules` znajdują się moduły ładowane jak paczki NPM — traktuj je jak lokalne zależności projektu.
1. Rozwiązywanie modułów działa dzięki `NODE_PATH=./modules`; przy nowych importach używaj bare specifiers (`import x from 'renia-magento-cart'`).
1. Jeśli moduł zawiera JSX, zapisuj pliki jako `.tsx` (plugin obsługuje `.tsx`/`.ts`/`.js` przy wyborze entry z `package.json`).
1. Nie programuj na własną rękę funkcjonalności, o które nie poprosił użytkownik — skupiaj się na zadanych celach.
1. Rejestr modułów jest w `src/framework/registry/moduleRegistry.ts` – statusy pochodzą z `app/etc/config.json` (brak wpisu = moduł wyłączony).
1. Router (`src/framework/router`) korzysta z rejestru modułów; wczytuje trasy z `routes.ts`/`routes.js`, sortuje je po `priority` i deduplikuje.
1. `renia-layout` buduje rejestr slotów z plików `layout.*`; wbudowany layout `1column` ma sloty m.in. `control-menu`.
1. `renia-interceptors` uruchamia pliki `interceptors/default.*` i `interceptors/<kontekst>.*` aktywnych modułów, pozwalając na wstrzykiwanie elementów do slotów.
1. Tworzenie stron/routingu: trasy opisuj w `routes.ts` (pola `path`, `componentPath`, opcjonalnie `layout`, `priority`); używaj tylko serializowalnych wartości.
1. Sloty: layout wybierany z meta trasy; slot entry może mieć `id`, `priority`, `componentPath`, `enabled`. Nie twórz zagnieżdżonych slotów.
1. Sloty wewnętrzne w produktach: `ProductTile` udostępnia `product-listing-actions`, a `ProductDetails` `product-view-actions`. Dodawaj rozszerzenia przez `api.subslots.add`, komponenty dostaną w `props` obiekt `product`.
1. Interceptory otrzymują API `slots.add({ slot, componentPath, id?, priority?, enabled? })`; duplikat `id` nadpisuje poprzedni wpis.
1. Rejestracja modułu: `registration.ts` z `name`, `version`, `type`, `dependencies`. Brak zależności = moduł wyłączony.
1. Status modułu ustawiasz w `app/etc/config.json` (`modules.<nazwa> = 1/0`).
1. Moduł `renia-graphql-client` dostarcza `QueryBuilder` i niskopoziomowy `executeRequest`; nie podmieniaj transportu — zawsze korzystaj z `executeGraphQLRequest` (`@framework/api/graphqlClient`) jako wspólnej warstwy.
1. Augmentery GraphQL: nagłówki rejestruj przez `registerGraphQLHeaderAugmenter`, payloady przez `registerGraphQLQueryAugmenter`. Wykorzystuj `request.operationId` (np. `magentoProduct.search`) i pracuj na `QueryBuilder`, nie na stringach.
1. Kod ma być wysokiej jakości – wydajny, stabilny i czytelny; unikaj specyficznych “quick fixów”.
1. Moduły utrzymuj niezależne: nie wiąż ich na sztywno; jeśli musisz rozszerzyć inny moduł, użyj interceptorów lub API modułu.
1. `renia-magento-category` – menu kategorii pobieraj dynamicznie (`fetchMenu`), SSR podaje `config.preloadedCategoryMenu`. Wymagane env: `MAGENTO_GRAPHQL_ENDPOINT`, opcjonalnie `MAGENTO_STORE_CODE`, `MAGENTO_ROOT_CATEGORY_ID`.
1. Header ma dwa poziomy (nawigacja + `header__menu`); nie mieszaj slotów.
1. Proxy `/api/magento/graphql` przekazuje `store` i opcjonalnie `MAGENTO_HOST_HEADER`. Zadbaj o osiągalność hosta z kontenera.
1. Komunikaty/logi twórz po angielsku (chyba że użytkownik wskaże inaczej).
1. Moduł katalogu (`renia-magento-catalog`) wstrzykuje listing produktów przez interceptor `category` do slotu `content`; moduł kategorii nie powinien zawierać tej logiki.
1. Każdy plik `.ts/.tsx/.js` oznacz `// @env: server|browser|mixed` zgodnie z przeznaczeniem.
1. Stosuj SOLID i pojedynczą odpowiedzialność – dziel logikę na mniejsze elementy.
1. Rejestr komponentów: używaj `src/framework/registry/componentRegistry.ts`. `registerComponents.ts` w module służy tylko do rejestracji.
1. Są dwa rejestry komponentów (`componentRegistryServer` i `componentRegistryClient`); importuj właściwy, jeśli potrzebujesz specyficznego środowiska.
1. Pliki `registerComponents.*` są automatycznie ładowane przez `src/framework/registry/loadModuleComponents`; nie dodawaj w nich efektów ubocznych innych niż rejestracja.
1. Struktura katalogów modułów: w głównym folderze modułu trzymaj tylko `package.json`, `registration.js`, `index.ts`, `types.ts` (i18n, docs jeśli istnieją). Kod umieszczaj w podkatalogach: `components/`, `hooks/`, `services/`, `interceptors/`, `pages/`, `utils/`. Nie twórz dodatkowych katalogów w główce modułu.
1. Śledzenie postępu: przy złożonych zadaniach (3+ kroki, wiele zmian) używaj `TodoWrite` do zarządzania listą zadań; zaznaczaj status (`pending`/`in_progress`/`completed`) i aktualizuj po każdym kroku.
1. Logowanie: zawsze używaj `getLogger()` z modułu `renia-logger` zamiast `console.log/warn/error`. Tworz loggera na poziomie modułu: `const logger = getLogger();` i używaj: `logger.debug()`, `logger.info()`, `logger.warn()`, `logger.error()` z nazwą modułu jako pierwszy argument.
1. Kontrakt produktu: wszystkie typy produktów muszą implementować `ProductInterface` z wspólnymi polami (`id`, `sku`, `name`, `urlKey`, `thumbnail`, `price`, `__typename`). Do dyskryminacji typów używaj type guard'ów (np. `isConfigurableProduct(product): product is ConfigurableProduct`) zamiast casów po `__typename`.
1. Polimorfizm typów: dla produktów stosuj wzorzec `ProductInterface & { __typename: 'SpecificType' }` – komponenty przyjmują `ProductInterface` i wykorzystują type guardy do renderowania specyficznego UI dla każdego typu.
