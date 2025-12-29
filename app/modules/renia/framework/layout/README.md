# Layout i system interceptorów

Ten katalog zawiera cały mechanizm składania UI z modułów. Dokument opisuje, jak działa drzewo layoutu, w jaki sposób moduły dopinają komponenty przy pomocy interceptorów oraz jak te informacje są używane podczas SSR i na kliencie.

## Cel i model mentalny

1. **LayoutTreeBuilder** buduje hierarchiczne drzewo `page → region → slot → komponent`. Każde wywołanie `api.layout.at(...).add(...)` w interceptorze modyfikuje to drzewo.
2. **buildRegions** zamienia rezultat `LayoutTreeBuilder.build()` w prostą mapę regionów (`Record<region, RegionEntry[]>`), którą wykorzystuje `LayoutShell` do wyrenderowania właściwego układu (np. `Layout1Column`).
3. **ExtensionsRegistry / ExtensionsOutlet** pozwalają na rozszerzanie komponentów w konkretnych „outletach” (np. ProductTile.actions) już po zbudowaniu layoutu.
4. Ten sam kod interceptorów uruchamiamy **na serwerze (SSR)**, aby przygotować początkowy layout i extension snapshot, oraz **na kliencie**, aby przy każdej nawigacji zbudować layout ponownie.

## Kluczowe elementy

### LayoutTreeBuilder (`LayoutTree.ts`)
- Root node ma ścieżkę `page`. Jeśli `at()` dostanie ścieżkę bez prefiksu, zostanie on dodany automatycznie (`at('header')` == `at('page.header')`).
- Preferowane API to `at(path)`, zwraca `LayoutNodeAPI`, dzięki któremu można:
  - `add(component, id, { sortOrder, props, meta })` – dodać potomka (komponent React lub string wskazujący komponent z registry).
  - `get('child')` – pobrać/utworzyć dalszy węzeł.
  - `at('a.b.c')` – nawigować po ścieżce (względnie do aktualnego node’a).
  - `remove(id)` i `setSortOrder(order)` – manipulować istniejącymi dziećmi.
- Pierwszy poziom dzieci `page.*` traktujemy jako **regiony** (np. `page.header`, `page.control-menu`, `page.content`). Kolejne poziomy to już sub sloty wewnątrz regionu.
- Sortowanie: `sortOrder.before` / `sortOrder.after` przyjmuje `id` rodzeństwa lub specjalny anchor `'-'` (początek/koniec). Brak sortOrder zachowuje kolejność dodawania.

### buildRegions (`buildRegions.ts`)
- Zamienia zbudowane drzewo w `RegionsSnapshot`. Każdy wpis zawiera `componentPath`/`component` oraz `props`/`meta` przekazane przy `add()`.
- Regiony trafiają do `LayoutShell`, który z kolei ładuje wybrany layout (np. `@renia/framework/layout/layouts/Layout1Column`). Aby użyć innego layoutu, wystarczy zarejestrować komponent i wskazać jego ścieżkę w definicji trasy.

### ExtensionsRegistry + ExtensionsOutlet
- `ExtensionsRegistry` przechowuje wpisy host → outlet → lista rozszerzeń. API:
  ```ts
  extensions.component('host').outlet('actions').add('componentPath', 'id', {
    sortOrder: { before: '-' },
    props: {...},
    meta: {...}
  });
  ```
- `ExtensionsOutlet` to komponent renderowany w hostach. Przykład użycia wewnątrz hosta:
  ```tsx
  import { ExtensionsOutlet } from '@renia/framework/layout';

  export function ProductTile(props) {
    return (
      <div>
        ...
        <ExtensionsOutlet host="app/components/ProductTile" outlet="actions" />
      </div>
    );
  }
  ```
- Podczas renderu `LayoutShell` owija cały layout w `ExtensionsProvider`, przekazując snapshot zbudowany na etapie SSR/CSR. Dzięki temu wszystkie hosty, w których dodaliśmy `ExtensionsOutlet`, otrzymują kontrybucje z modułów.

## Jak działają interceptory

### Struktura plików
- Każdy moduł może mieć katalog `interceptors/` z plikami `default.ts` i `<context>.ts` (np. `product.ts`).
- Interceptor eksportuje funkcję `(api, context) => void | Promise<void>`.
- Moduł jest włączany/wyłączany przez `app/etc/config.json`. Loader (`loadInterceptors` na serwerze i `loadInterceptorsClient` w przeglądarce) odczytuje tę konfigurację i uruchamia tylko aktywne moduły.

### API przekazywane do interceptorów
SSR i klient przekazują tę samą strukturę:
```ts
const api = {
  registerComponents,                     // @renia/framework/registry/componentRegistry
  registerProductTypeComponentStrategy,   // (opcjonalne) strategie per typ encji
  layout: layoutTree.at('page'),          // LayoutNodeAPI
  extend: extensionsRegistry              // ExtensionsRegistry
};
```
- **`registerComponents`** – zarejestruj komponenty zanim użyjesz ich jako stringów w `layout.add()`/`extend.component()`.
- **`layout`** – start węzła `page`; dalej używaj `at('header')`, `at('control-menu')`, itd. aby dodawać regiony i komponenty.
- **`extend`** – pozwala modyfikować host komponentów już po zbudowaniu layoutu. Używany do rozszerzeń typu „outlet”.

### Kolejność uruchamiania
1. **SSR** (`app/entry/server/index.tsx`):
   - Tworzymy nowy `LayoutTreeBuilder` + `ExtensionsRegistry` + `api`.
   - `loadInterceptors('default', ...)` odpala globalne interceptory.
   - Na podstawie dopasowanej trasy pobieramy listę kontekstów (`routes.ts` → `route.contexts`) i uruchamiamy `loadInterceptors(ctx, { includeDefault: false })` dla każdego z nich.
   - Po wykonaniu wszystkich interceptorów wywołujemy `layoutTree.build()` i `buildRegions(...)`, a snapshot `extensions.snapshotSorted()` trafia do bootstrapa SSR.
2. **Klient** (`app/modules/renia/framework/runtime/AppRoot.tsx`):
   - Przy nawigacji [`matchRoutes`] ustala aktualne konteksty.
   - Tworzy nowy `LayoutTreeBuilder` i `ExtensionsRegistry`, ładuje interceptory z mapy zarejestrowanej przez aplikację (np. w `app/entry/client.tsx`), a następnie aktualizuje `regions` i `extensions` w stanie (`setRegions`, `setExtensions`).
   - Dzięki temu layout reaguje na zmiany trasy bez przeładowania strony.

### Generowanie mapy interceptorów
- Skrypt `npm run generate:interceptors` (`scripts/generate-interceptor-map.mjs`) skanuje aktywne moduły i tworzy `generated/interceptors/interceptorMap.generated.ts`, a aplikacja rejestruje mapę przed pierwszym użyciem loadera.
- Uruchamiaj ten skrypt po dodaniu nowego pliku interceptorów albo włączaniu modułu.

## Przykład: dodanie komponentu do regionu i outletu
```ts
// app/modules/example/interceptors/product.ts
import { PromoBadge } from '../components/PromoBadge';

export default function product(api) {
  api.registerComponents?.({
    'example/components/PromoBadge': PromoBadge
  });

  // 1. Dodajemy kafelek do regionu header
  api.layout
    .at('header')
    .add('example/components/PromoBadge', 'promo-badge', {
      sortOrder: { after: 'search-bar' },
      props: { variant: 'pdp' }
    });

  // 2. Dopinamy badge do outletu ProductTile.actions
  api.extend
    ?.component('app/components/ProductTile')
    .outlet('actions')
    .add('example/components/PromoBadge', 'promo-badge-tile', {
      sortOrder: { before: '-' }
    });
}
```

## Konwencje i dobre praktyki
- **Idempotencja**: Interceptory mogą uruchamiać się wielokrotnie (SSR + klient + hot reload). Nie polegaj na efektach globalnych, staraj się unikać losowych ID.
- **Nazewnictwo ID**: używaj stabilnych identyfikatorów (`'cart-link'`, `'wishlist-heart'`) – ułatwia to `sortOrder.before/after` i ewentualne `remove()`.
- **Rejestrowanie komponentów**: zawsze zarejestruj komponent zanim odwołasz się do niego stringiem; unikniesz błędów przy hydratacji.
- **Regiony**: trzymaj się istniejących regionów (`header`, `control-menu`, `content`, `footer`, `global-overlay`). Jeśli dodajesz nowy, upewnij się, że layouty (`Layout1Column`, `Layout2ColumnsLeft`, itp.) go renderują.
- **Outlety**: gdy tworzysz komponent-host, dodaj `ExtensionsOutlet`, by inne moduły mogły się pod niego podpiąć.
- **Sort order**: gdy zależy Ci na pozycji absolutnej, użyj `before: '-'` (początek) lub `after: '-'` (koniec). W pozostałych przypadkach podawaj konkretne ID istniejących elementów.

## Gdzie dopisać zmiany
- Zmiany w API layoutu ↔ `docs/MODULES.md` i ten plik (`app/modules/renia/framework/layout/README.md`).
- Nowe regiony / layouty → opisz także w `docs/rendering-matrix.md`, aby inni wiedzieli, jak z nich korzystać.

W razie wątpliwości – przeczytaj `app/modules/renia/**/interceptors/*.ts` (koszyk, życzenia, katalog). Pokazują one kompletne przykłady rejestracji komponentów w layoutach i outletach.
