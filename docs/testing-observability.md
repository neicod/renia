# Testing i observability

Ten dokument opisuje minimalny zestaw narzędzi do diagnozy zachowania routingu/layoutu/cache.

---

## Uruchamianie testów

- `npm test` — uruchamia testy + `npm run generate` (przed testami).
- Invarianty architektoniczne są w `tests/*.test.ts` (np. brak nested `node_modules`, brak `api.layout.get`, tylko jeden catch-all `/*`).

---

## Tryb debug SSR

Ustaw:
- `SSR_DEBUG=1`

Wtedy dostępne są endpointy debug:

### `/api/debug/layout?url=...`
Zwraca:
- dopasowaną trasę (`match`),
- finalne `contexts` i `routeMeta` (z uwzględnieniem `route.handler`),
- listę uruchomionych interceptorów,
- snapshot regionów i extensions,
- wynik walidacji layoutu.

### `/api/debug/route?url=...`
Lżejszy debug routingu, przydatny gdy interesuje Cię **tylko resolver URL** i `routeMeta/contexts`.

Zwraca:
- `match` (path, module, priority, handler),
- `params`,
- `contexts`,
- `routeMeta`,
- listę uruchomionych interceptorów (default + resolved contexts).

Jeśli URL jest rozwiązywany przez Magento (`renia-magento-routing`), `routeMeta` może zawierać `__debug` z informacjami o:
- `urlResolver` (candidate + resolved),
- cache-key’ach i hit/miss (tylko w debug endpointach).

### `/api/debug/cache`
Zwraca statystyki cache’i TTL (server + runtime).

Opcjonalnie:
- `/api/debug/cache?prefix=magentoRouting` — filtruje wynik po nazwie/kluczu cache.

---

## Telemetria klientowa `/api/page-context`

W przeglądarce zbieramy proste statystyki wywołań `/api/page-context` (per sesja) w `sessionStorage`.

- key: `__renia_page_context_telemetry__`
- licznik: ile razy runtime próbował pobrać PageContext, ile było cache hit/miss, ile było requestów sieciowych, oraz ostatnie zdarzenia (do debug).

W razie potrzeby możesz zresetować dane w konsoli przez:
- `resetPageContextTelemetry()` (eksport w `app/modules/renia/framework/runtime/pageContextClient.ts`)

## Logowanie (telemetria)

Przydatne flagi:
- `RENIA_LOG_PAGE_CONTEXT=1` — loguje SSR bootstrap i `/api/page-context`.
- `RENIA_LOG_INTERCEPTORS=1` — loguje interceptory per request (SSR i `/api/page-context`).
- `RENIA_VALIDATE_LAYOUT=1` — waliduje layout artifacts (w dev domyślnie włączone, w prod wyłączone).
