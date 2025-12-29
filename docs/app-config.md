# AppConfig (bootstrap) i RequestContext (SSR)

Ten dokument opisuje **kontrakt `AppConfig`** (czyli `window.__APP_BOOTSTRAP__.config`) oraz **RequestContext** używany na serwerze (SSR i endpointy `/api/*`).

Cel: zapewnić, że moduły czytają konfigurację **w jeden, spójny sposób** (SSR i CSR), bez ad-hoc odczytów z `window` i bez globalnego stanu.

---

## TL;DR (dla modułów)

- **Nie czytaj** `window.__APP_BOOTSTRAP__` bezpośrednio w modułach.
- **Czytaj config** przez `readAppConfig()`:
  - import: `import { readAppConfig } from '@renia/framework/runtime/appConfig'`
  - działa w `@env: mixed` (SSR i browser)
- Magento (i inne integracje) trzymamy pod: `config.integrations.<name>.*`.

---

## Skąd bierze się `AppConfig`?

### SSR (serwer)
1. Serwer wywołuje `buildAppConfig(...)` (provider rejestrowany przez moduły, np. `renia-magento-store`).
2. Wynik jest wkładany do **RequestContext** (request-scoped) przez `runWithRequestContext(...)`.
3. SSR renderuje HTML i wstrzykuje `config` do bootstrapa jako `window.__APP_BOOTSTRAP__.config`.

Ważne: config na serwerze jest **per-request**, nie globalny.

### CSR (przeglądarka)
Po hydracji klient ma `window.__APP_BOOTSTRAP__.config` z SSR i używa go jako źródła prawdy dla runtime.

---

## Jak czytać config (API)

### `readAppConfig()`
Plik: `app/modules/renia/framework/runtime/appConfig.ts`

Zasada działania:
- SSR: czyta z request-scoped RequestContext (AsyncLocalStorage)
- CSR: czyta z `window.__APP_BOOTSTRAP__.config`

---

## Kontrakt danych `AppConfig`

`AppConfig` jest obiektem JSON-serializowalnym. Pole `config` jest częścią `__APP_BOOTSTRAP__`.

### Pola bazowe (stabilne)
- `storeCode?: string | null` — kod store view, używany w wielu miejscach (routing, cache keys, nagłówki GraphQL).
- `locale?: string | null` — locale (np. `pl_PL`).
- `store?: Record<string, unknown> | null` — opcjonalny obiekt store (integracja może go wypełnić; framework nie narzuca schematu).

### `integrations`
Namespace na konfiguracje integracji (Magento, CMS, payment, itp.).

Przykład (Magento):
```json
{
  "storeCode": "pl",
  "locale": "pl_PL",
  "integrations": {
    "magento": {
      "proxyEndpoint": "/api/magento/graphql",
      "graphqlEndpoint": "https://m2.example/graphql",
      "rootCategoryId": "2",
      "storeCode": "pl",
      "hostHeader": "m2.example",
      "prefetch": {
        "categoryMenu": []
      }
    }
  }
}
```

Zasady:
- **Nie dodajemy** pól integracyjnych na top-level (np. `magentoProxyEndpoint`) — zawsze pod `integrations.*`.
- Prefetch SSR (jeśli potrzebny) też trafia pod `integrations.<name>.prefetch.*`.

---

## RequestContext (server)

RequestContext jest tworzony per-request i dostępny tylko w runtime serwera.

Plik: `app/modules/renia/framework/server/hooks.ts`

Zawiera:
- `requestId` — identyfikator requestu (z `x-request-id` lub generowany)
- `purpose` — `ssr | page-context | debug`
- `req`, `url`, `prefix`
- `config` — wynik `buildAppConfig(...)`

### Po co?
- Unikamy globalnego stanu i race-condition przy równoległych requestach.
- Moduły/utility w `@env: mixed` mogą bezpiecznie czytać config w SSR.

---

## Anti-patterns (zakazane)

- Legacy global config — **nie istnieje** (usunięte).
- `window.__APP_BOOTSTRAP__` w modułach — zamiast tego `readAppConfig()`.
- “magento”-pola w core (`app/modules/renia/framework/`) — core musi pozostać integration-agnostic.
