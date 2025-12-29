# PageContext i `/api/page-context`

Ten dokument wyjaśnia, czym jest `PageContext`, jak jest budowany w czasie SSR/CSR oraz jak działa endpoint `/api/page-context`. To jedyne źródło prawdy dla modułów rozszerzających dane kontekstowe stron.

---

## Po co nam PageContext
- Zapewnia minimalny zestaw informacji o aktualnym store/kontekście (`store.code`, `kind`, rozszerzenia modułów).
- Jest przekazywany do komponentów poprzez `PageContextProvider` (`app/modules/renia/framework/runtime/PageContext.tsx`), dzięki czemu UI i moduły mogą reagować na typ strony, store, customer segment itp.
- Może być augmentowany przez moduły (np. dopisanie danych specyficznych dla PDP/PLP) bez łamania kontraktu frameworka.

---

## Model danych
Plik `app/modules/renia/framework/runtime/PageContext.tsx` definiuje:

```ts
export type PageContext = {
  store: { id?: string | null; code?: string | null };
  kind?: string;                // opcjonalny dyskryminator (np. 'product', 'category')
  extensions?: Record<string, unknown>; // przestrzeń nazw dla modułów
};
```

Moduły mogą rozszerzać interfejs `PageContextExtensions` przez deklarację TypeScript (declaration merging), aby dodać typowane pola w `extensions`.

---

## Cykl życia (SSR → CSR)

1. **SSR (`app.get('*')` w `app/entry/server/index.tsx`):**
   - Po zbudowaniu layoutu i zaczytaniu `routeMeta`, framework tworzy bazowy `PageContext` i przepuszcza go przez `applyPageContextAugmenters`.
   - Wynik trafia do bootstrapa (`bootstrap.pageContext`) i jest hydratowany na kliencie przez `PageContextProvider`.

2. **CSR (nawigacja klientowa w `AppRoot`):**
   - Jeśli bootstrap nie zawiera kontekstu lub dotyczy innego typu strony, klient wykonuje `GET /api/page-context?url=<actual-url>` i uzupełnia stan hooka `useState`.
   - Każda kolejna nawigacja (React Router) może ponownie wywołać endpoint, aby zapewnić świeży kontekst (np. inne segmenty, rozszerzenia).

---

## Endpoint `/api/page-context`

| Element            | Opis                                                                 |
|--------------------|----------------------------------------------------------------------|
| Metoda             | `GET`                                                                |
| Parametry          | `url` (wymagany) – pełny URL klienta (ścieżka + query)               |
| Nagłówki opcjonalne| `x-renia-page-context-reason`, `x-renia-client-instance`, `x-renia-nav-seq` (telemetria/logi) |
| Odpowiedź          | `200 OK { pageContext, contexts, routeMeta }` lub błąd `4xx/5xx`     |

Przebieg:
1. Serwer dopasowuje trasę (`routes.ts`) oraz oblicza prefiksy store/locale.
2. Jeśli trasa ma handler (`route.handler`), jest on uruchamiany i może zwrócić:
   - `meta` → scalane do `routeMeta`,
   - `contexts` → lista kontekstów (np. `['product']`, `['category']`, `['cms']`), używana przez klienta do przebudowy layoutu.
3. Serwer ładuje interceptory (`default` + `contexts`) z noop layoutem – endpoint potrzebuje efektów ubocznych (rejestracja PageContext augmenterów), ale nie potrzebuje renderowania.
3. Baza `PageContext` jest tworzona z informacji o sklepie (`config.storeCode` lub `config.store.code`).
4. `applyPageContextAugmenters` nadaje finalny kształt i wynik jest zwracany jako JSON.

> Endpoint nie zwraca gotowego layoutu ani HTML. Zwraca natomiast `contexts` i `routeMeta`, aby klient mógł przebudować layout i uniknąć duplikowania requestów (SSR vs SPA navigation).

---

## `routeMeta` (kontrakt)

`routeMeta` jest „meta-danymi trasy”, które pochodzą z:
- `routes.ts` (`route.meta`) oraz
- opcjonalnie z handlera trasy (`route.handler`), który może doprecyzować `meta` i `contexts` (np. po Magento `urlResolver`).

Kontrakt i normalizacja są zdefiniowane w `app/modules/renia/framework/router/routeMeta.ts` (wartości niezgodne są „downgrade’owane” do bezpiecznych domyślnych).

Najważniejsze pola:
- `type?: string` – dyskryminator typu strony, wykorzystywany m.in. do `PageContext.kind` i warunkowego renderowania wpisów layoutu (`onlyForRouteTypes`).
- `layout?: string` – ścieżka layoutu (np. `@renia/framework/layout/layouts/Layout2ColumnsLeft`).
- `__ssrPath?: string` – pole wewnętrzne, używane do odróżniania meta wstrzykniętego dla konkretnego URL (nie opieraj na tym logiki modułu).

W praktyce, runtime rozpoznaje m.in.:
- `type='redirect'` + `redirectTo` + `redirectCode` → klient/SSR wykonuje redirect bez budowania layoutu.
- `type='not-found'` → SSR odpowiada `404`, a layout dostaje kontekst `not-found`.
- `type='category'|'product'|'cms'|'search'` → layout/interceptory dostają odpowiednie konteksty, a moduły mogą korzystać z danych w `routeMeta` (np. SSR prefetch listingu).

---

## Augmentery (`pageContextAugmenters.ts`)

Moduły mogą zarejestrować augmentery, aby dopisać dane do `PageContext`:

```ts
import { registerPageContextAugmenter } from '@renia/framework/runtime/pageContextAugmenters';

registerPageContextAugmenter((ctx, { routeMeta, routeContexts }) => {
  if (routeContexts.includes('product') && routeMeta?.product?.sku) {
    ctx.kind = 'product';
    ctx.extensions = {
      ...(ctx.extensions ?? {}),
      product: { sku: routeMeta.product.sku }
    };
  }
});
```

Argumenty augmentera:
- `ctx` – mutable `PageContext`. Zmiany dokonane w miejscu są zwracane do klienta.
- `args.req` – ścieżka i pełny URL żądania.
- `args.routeMeta` – meta dane obliczone przez trasę/handler (np. `searchProductListing`).
- `args.routeContexts` – lista kontekstów layoutu (default/product/category/etc.).

**Zasady:**
1. Augmentery muszą być deterministyczne i bez efektów ubocznych (mogą uruchamiać się wiele razy: SSR, CSR, /api/page-context).
2. Nie zapisujemy referencji do `req`/`res`; funkcja powinna zakończyć się szybko (bez I/O).
3. Nie umieszczamy danych prywatnych, które nie mogą być zwracane w JSON do przeglądarki.

---

## Kiedy klient rewaliduje PageContext?

W `AppRoot` (client runtime):
- Jeśli `bootstrap.pageContext` nie istnieje → natychmiastowe żądanie `/api/page-context` (powód `mount-revalidate`).
- Jeśli trasa ma konteksty inne niż `default`, a bootstrapowy kontekst wygląda na domyślny → żądanie `/api/page-context`.
- Przy każdej nawigacji SPA → opcjonalne żądanie z powodem `navigation` (framework może pominąć odpowiedź, jeśli endpoint zwróci błąd).

### Normalizacja URL (spójność)

Klient wysyła do `/api/page-context` *kanoniczny* `url`:
- zawsze `pathname + search` (bez hosta),
- query jest deduplikowane (`dedupeSearch`) tak, aby “ostatnia wartość wygrywała” i nie było podwójnych kluczy.

To jest krytyczne dla spójności listingu/search (unikanie sytuacji “raz brak query, raz podwójne query”).

### Cache i prefetch (wydajność nawigacji)

Aby nawigacja SPA zachowywała się “jak SSR” (mniej requestów po kliknięciu), klient:
- cachuje odpowiedzi `/api/page-context` w pamięci (request coalescing + TTL),
- może prefetchować PageContext na hover/focus linków.

W praktyce używamy `@renia/framework/router/PrefetchLink` zamiast gołego `react-router-dom/Link` dla kluczowych linków (kategorie, produkty).

---

## Debug i telemetria
- Włączenie `RENIA_LOG_PAGE_CONTEXT=1` powoduje logowanie na serwerze (zarówno w SSR, jak i `/api/page-context`) wraz z nagłówkami diagnostycznymi.
- Klient wysyła `x-renia-client-instance` (losowy identyfikator sesji `sessionStorage`) oraz `x-renia-nav-seq` (kolejny numer nawigacji) – ułatwia korelację logów z zachowaniem użytkownika.

---

## Co aktualizować przy zmianach?
- **Nowe pola w `PageContext`** → `app/modules/renia/framework/runtime/PageContext.tsx` + ten dokument.
- **Zmiany endpointu** → sekcja „Endpoint `/api/page-context`”.
- **Nowe augmentery/framework API** → sekcja „Augmentery”.
- **Zmiana cyklu życia** → opis SSR/CSR powyżej oraz `_map.md`, by wskazać nowe źródło prawdy.
