# Instrukcje dla agentów i developerów

Zawiera praktyczny przewodnik po najczęstszych zadaniach przy rozwoju Renii. Zanim zaczniesz, przejrzyj [`README.md`](README.md) aby zrozumieć ogólną architekturę.

---

## Zasady ogólne

1. Odpowiadaj po polsku i zwięźle. Terminy techniczne pozostawiaj w angielsku.
2. **[KRYTYCZNE] Modułowe rozszerzenia:** Moduł A nigdy nie modyfikuje kodu modułu B. Rozszerzenia implementuj poprzez interceptory, sloty, augmentacje GraphQL lub publiczne API modułu. Każdy moduł musi być wyłączalny w `config.json` bez wpływu na inne.
3. Zanim zaczniesz, zerknij do `README.md`, `docs/MODULES.md` oraz `docs/concept.md` w obrębie modułu.
4. Każdy plik `.ts/.tsx/.js` oznacz `// @env: server|browser|mixed` na początku (KRYTYCZNE dla SSR/hydratacji).
5. Nigdy nie używaj `window.localStorage` bezpośrednio – zawsze `@framework/storage/browserStorage`.
6. Pliki tłumaczeń: `app/modules/<vendor>/<module>/i18n/<lang>.json` (wewnątrz `frontend`). Pamiętaj o `npm run build:i18n` po zmianach.
7. Struktura katalogów modułu: w głównym folderze tylko `package.json`, `registration.js`, `index.ts`. Kod w: `components/`, `hooks/`, `services/`, `interceptors/`, `pages/`, `utils/`.
8. Śledzenie postępu: przy złożonych zadaniach (3+ kroki) używaj `TodoWrite` do zarządzania listą; aktualizuj status (`pending`/`in_progress`/`completed`) po każdym kroku.

---

## Template-Based Layout System (WAŻNE!)

Od niedawna Renia używa **Template-Based Layout System**. Layout to pełny komponent React w `app/modules/renia/layout/layouts/`. Każdy route wybiera layout przez `meta.layout`.

### Dostępne layouty

| Layout | Ścieżka | Zastosowanie |
|--------|--------|--------------|
| `Layout1Column` | `@framework/layout/layouts/Layout1Column` | Strony bez sidebara (login, wishlist, checkout) |
| `Layout2ColumnsLeft` | `@framework/layout/layouts/Layout2ColumnsLeft` | Kategorie, produkty, wyszukiwarka (lewy sidebar) |
| `LayoutEmpty` | `@framework/layout/layouts/LayoutEmpty` | Logowanie, rejestracja (bez headera/footera) |

### Jak zdefiniować route z layoutem

```typescript
// @env: mixed
// app/modules/<vendor>/<module>/routes.ts

export default [
  {
    path: '/my-page',
    componentPath: 'module-name/pages/MyPage',
    priority: 30,
    contexts: ['my-page'],
    meta: {
      layout: '@framework/layout/layouts/Layout1Column',  // ← ZAWSZE pełna ścieżka
      type: 'my-page'
    }
  }
];
```

### Jak dodać nowy layout

1. Utwórz plik: `src/framework/layout/layouts/LayoutMyNewLayout.tsx`
2. Implementuj: `type LayoutProps = { regions, main, routeMeta }`
3. Dodaj do eksportu w: `src/framework/layout/index.ts`
4. Zarejestruj w: `src/server/index.tsx` i `src/client/index.tsx`

```typescript
// @env: mixed
// src/framework/layout/layouts/LayoutMyNewLayout.tsx

import React from 'react';
import { Link } from 'react-router-dom';

type LayoutProps = {
  regions: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function LayoutMyNewLayout({ regions, main }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="header">
        <div className="header__inner">
          <div className="header__brand">
            <Link to="/" className="brand-logo">Renia Store</Link>
          </div>
          <div className="slot-stack">{regions['control-menu']}</div>
        </div>
        <div className="header__menu">{regions['header']}</div>
      </header>

      <main className="main">
        {regions['content']}
        {main}
      </main>

      <footer className="footer">{regions['footer']}</footer>

      {regions['global-overlay']}
    </div>
  );
}
```

Następnie w `src/server/index.tsx` i `src/client/index.tsx`:

```typescript
import { LayoutMyNewLayout } from '@framework/layout';

registerComponents({
  '@framework/layout/layouts/LayoutMyNewLayout': LayoutMyNewLayout
});
```

---

## Interceptory i regions/extensions

### Hierarchiczny system layoutu

Layout jest budowany jako drzewo z root node'em `page`:

```
page (root)
├── header
│   ├── control-menu (koszyk, logowanie, wishlist)
│   └── main-menu
├── content (główna zawartość)
├── left (lewy sidebar)
├── footer
└── global-overlay (powiadomienia, toast'y)
```

### Jak dodać komponent do layoutu

Używaj fluent API `api.layout.get()` aby nawigować po hierarchii:

```typescript
// @env: mixed
// app/modules/<vendor>/<module>/interceptors/default.ts

import { MyComponent } from '../components/MyComponent';

export default (api) => {
  // 1. Zarejestruj komponent
  api.registerComponents?.({
    'module-name/components/MyComponent': MyComponent
  });

  // 2. Dodaj do layoutu - użyj get() i add()
  api.layout
    .get('header')
    .add('module-name/components/MyComponent', 'my-component-id', {
      sortOrder: { before: '-' },  // Domyślnie pierwszy element
      props: { variant: 'dark' }
    });
};
```

**Ścieżki hierarchii:**
- `api.layout.get('page.header')` - nagłówek
- `api.layout.get('page.header.control-menu')` - menu kontrolne
- `api.layout.get('page.content')` - główna zawartość
- `api.layout.get('page.left')` - lewy sidebar
- `api.layout.get('page.footer')` - footer
- `api.layout.get('page.global-overlay')` - overlay

### Sortowanie elementów

Zamiast `priority`, używaj `sortOrder` z `before` lub `after`:

```typescript
// Domyślnie (pierwszy element)
{ sortOrder: { before: '-' } }

// Przed konkretnym elementem
{ sortOrder: { before: 'search-bar' } }

// Po konkretnym elemencie
{ sortOrder: { after: 'menu' } }
```

### Rozszerzenia komponentów (component extensions)

Rozszerzenia “wewnątrz komponentów” realizujemy przez `api.extend` + `ExtensionsOutlet` (host komponent + outlet):

```typescript
api.extend
  .component('renia-magento-product/pages/components/ProductDetails')
  .outlet('actions')
  .add('renia-magento-wishlist/components/WishlistHeart', 'wishlist-heart');
```

### Kontekst-specificzny interceptor

Interceptory mogą być załadowane dla konkretnych kontekstów trasy:

```typescript
// @env: mixed
// app/modules/<vendor>/<module>/interceptors/category.ts
// Ten interceptor ładuje się tylko dla route'ów z contexts: ['category']

export default (api) => {
  api.registerComponents?.({
    'module-name/components/CategoryFilters': CategoryFilters
  });

  api.layout
    .get('page.left')
    .add('module-name/components/CategoryFilters', 'category-filters');
};
```

---

## Rejestracja komponentów

Komponenty **MUSZĄ** być zarejestrowane w `api.registerComponents()` w interceptorze, aby mogły być ładowane na SSR i kliencie.

```typescript
// ✅ DOBRY PATTERN
export default (api: InterceptorApi) => {
  api.registerComponents?.({
    'renia-magento-catalog/components/ProductTile': ProductTile,
    'renia-magento-catalog/pages/CategoryPage': CategoryPage
  });
};

// ❌ ZŁY PATTERN - nie rejestrujemy w osobnym pliku
// Nie tworz registerComponents.ts
```

---

## `@env` markery (KRYTYCZNE!)

Każdy plik musi mieć marker na początku. Jest to kluczowe dla SSR/hydratacji.

```typescript
// @env: mixed      // Zarówno SSR jak i klient
// @env: server     // Tylko SSR (Node.js)
// @env: browser    // Tylko klient (przeglądarka)
```

### Kiedy co używać

| Typ | `@env` | Przykład |
|-----|--------|---------|
| Komponent React (route, slot, layout) | `mixed` | Page, Layout, ProductTile |
| Interceptor | `mixed` | `interceptors/default.ts` |
| Route definition | `mixed` | `routes.ts` |
| Hook w komponencie | `mixed` | `useProductListing`, `useCartManager` |
| Serwer (Node.js) | `server` | SSR worker, server logger |
| Klient (przeglądarka) | `browser` | Window API, browser storage |
| GraphQL Request | `mixed` | `services/productRepository.ts` |

### ⚠️ WAŻNE dla interceptorów

Interceptory MUSZĄ mieć `@env: mixed`! Jeśli będą `@env: server`, komponenty nie będą zarejestrowane na kliencie.

```typescript
// ✅ DOBRY
// @env: mixed
export default (api: InterceptorApi) => {
  api.registerComponents?.({ /* ... */ });
};

// ❌ ZŁY
// @env: server
export default (api: InterceptorApi) => {
  // Nie będzie załadowany na kliencie!
};
```

---

## GraphQL i augmentery

- Zawsze używaj `executeGraphQLRequest` z `@framework/api/graphqlClient`, nie `executeRequest` bezpośrednio.
- Nagłówki: `registerGraphQLHeaderAugmenter`
- Payloady: `registerGraphQLQueryAugmenter`

```typescript
import { registerGraphQLHeaderAugmenter } from '@framework/api/graphqlClient';

registerGraphQLHeaderAugmenter((headers) => {
  headers['x-custom'] = 'value';
});
```

---

## Debugowanie i testy

### Logowanie

```bash
# Wyłącz logowanie GraphQL
GRAPHQL_LOG_REQUEST=0 GRAPHQL_LOG_RESPONSE=0 npm run dev:server
```

### Hydratacja

Jeśli klient i serwer pokazują inną zawartość:

```javascript
// W konsoli przeglądarki
console.log(JSON.stringify(window.__APP_BOOTSTRAP__, null, 2));
```

### Testy modułowe

```bash
npm test                    # Uruchom testy
DEBUG=* npm test           # Z logowaniem
```

---

## Typowe błędy

### ❌ "Component not found: module-name/components/MyComponent"

**Przyczyna:** Komponent nie zarejestrowany.

**Rozwiązanie:**
```typescript
api.registerComponents?.({
  'module-name/components/MyComponent': MyComponent
});
```

### ❌ "api.layout is undefined" (SSR)

**Przyczyna:** Interceptor ma `@env: browser` lub brakuje api.layout.

**Rozwiązanie:**
```typescript
// @env: mixed  ← Zmień to
export default (api: InterceptorApi) => {
  api.layout.get('header').add(MyComponent, 'my-id');
};
```

### ❌ "Failed to load layout: @framework/layout/layouts/LayoutCustom"

**Przyczyna:** Layout nie zarejestrowany w `src/server/index.tsx` lub `src/client/index.tsx`.

**Rozwiązanie:**
```typescript
// src/server/index.tsx i src/client/index.tsx
import { LayoutCustom } from '@framework/layout';

registerComponents({
  '@framework/layout/layouts/LayoutCustom': LayoutCustom
});
```

### ❌ Slot nie renderuje się

**Sprawdź:**
1. Komponent zarejestrowany w `api.registerComponents()`?
2. Dodany do slotu przez `api.layout.get().add()`?
3. `@env: mixed`?

---

## Pełna spójność i czystość kodu (OBOWIĄZKOWE!)

Kod musi być **spójny**, **czysty** i **maintainable**. To jest obowiązowe dla każdego commita.

### 1. Spójność notacji w kodzie

**Notacja property access:**
- ✅ Regiony/obiekty z myślnikami: `regions['control-menu']`, `regions['global-overlay']`
- ✅ Regiony bez myślników: `regions['header']`, `regions['content']`, `regions['footer']`, `regions['left']`
- ❌ Nie mieszaj: nie rób `regions.header` i `regions['header']` w tym samym pliku

```typescript
// ✅ DOBRY - konsekwentnie ze słownikami
export default function Layout1Column({ regions, main }: LayoutProps) {
  return (
    <div className="app-shell">
      <header>{regions['header']}</header>
      <div>{regions['control-menu']}</div>
      <main>{regions['content']}{main}</main>
      <footer>{regions['footer']}</footer>
      {regions['global-overlay']}
    </div>
  );
}

// ❌ ZŁY - mieszanie notacji
export default function Layout1Column({ regions, main }: LayoutProps) {
  return (
    <div className="app-shell">
      <header>{regions.header}</header>                  {/* ← Jest .header */}
      <div>{regions['control-menu']}</div>              {/* ← Jest ['control-menu'] */}
      <main>{regions.content}{main}</main>              {/* ← Jest .content */}
      <footer>{regions['footer']}</footer>              {/* ← Jest ['footer'] */}
    </div>
  );
}
```

### 2. Typy i interfejsy

**Zawsze definiuj typy:** Nie rób `any` bez powodu.

```typescript
// ✅ DOBRY
interface LayoutProps {
  regions: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
}

// ❌ ZŁY
function MyLayout(props: any) { ... }
```

### 3. Imports i eksporty

**Porządek importów:**
```typescript
// ✅ DOBRY - imports w porządku
// @env: mixed
import React from 'react';
import { Link } from 'react-router-dom';

import { MyComponent } from '../components/MyComponent';
import type { LayoutProps } from './types';

// ❌ ZŁY - random porządek
import type { LayoutProps } from './types';
import { MyComponent } from '../components/MyComponent';
import React from 'react';
```

**Named vs default exports:**
- Components: `export default` (jeden komponent per plik)
- Utils/helpers: `export const` (wiele funkcji)
- Types: `export type`

### 4. CSS klasy i styling

**Konwencje CSS:**
- CSS klasy: `kebab-case` (`.app-shell`, `.control-menu`, `.header__inner`)
- BEM notation: `.block__element--modifier`
- Inline styles: tylko dla Layout komponentów z `display: grid`, `gap` itd.

```typescript
// ✅ DOBRY - CSS klasy dla struktury
<div className="app-shell">
  <header className="header">
    <div className="header__inner">
      <div className="slot-stack">{regions['control-menu']}</div>
    </div>
  </header>
</div>

// ❌ ZŁY - wszystko inline styles
<div style={{ maxWidth: '1220px', margin: '0 auto' }}>
  <header style={{ display: 'flex' }}>
    <div style={{ gap: '1rem', display: 'flex' }}>
      {regions['control-menu']}
    </div>
  </header>
</div>
```

### 5. Nazewnictwo zmiennych

**camelCase dla zmiennych, snake_case tylko w konfigach JSON:**

```typescript
// ✅ DOBRY
const controlMenuItems = regions['control-menu'];
const renderedRegions: Record<string, React.ReactNode> = {};

// ❌ ZŁY
const control_menu_items = regions['control-menu'];
const rendered_regions: Record<string, React.ReactNode> = {};
```

### 6. Brak martwego kodu

**Zawsze usuwaj:**
- Nieużywane zmienne
- Zakomentowany kod
- `console.log` w produkcji (zostawiaj tylko `console.error` i `console.warn`)
- Niewykorzystane importy

```typescript
// ❌ ZŁY - martwy kod
const unusedVar = 123;
// const oldCode = () => { ... };
console.log('debug');

// ✅ DOBRY - czysty
const neededVar = 123;
```

### 7. Aktualizacja dokumentacji

Gdy zmieniasz architekturę (np. przenosisz moduł):
1. Aktualizuj paths w `AGENT_INSTRUCTIONS.md`
2. Aktualizuj `README.md` jeśli dotyczy architektury
3. Dodaj notę o breaking changes jeśli są

**Przykład - stara ścieżka to `renia-layout/layouts/1column`, nowa to `@framework/layout/layouts/Layout1Column`:**

```markdown
// STARE (do usunięcia z przykładów)
meta: { layout: 'renia-layout/layouts/1column' }

// NOWE (używaj tego)
meta: { layout: '@framework/layout/layouts/Layout1Column' }
```

### 8. Testing i weryfikacja

Zawsze testuj:
```bash
npm run build          # Brak TypeScript errors
npm run lint           # ESLint pass
# Sprawdź SSR hydratację w dev tools
```

---

## Checklist dla nowego route'a

```
[ ] 1. routes.ts z path, componentPath, meta.layout
[ ] 2. Page komponent (np. MyPage.tsx)
[ ] 3. interceptors/default.ts z registerComponents
[ ] 4. Sprawdź @env markery (muszą być mixed)
[ ] 5. npm run build
[ ] 6. npm run dev:server (SSR check)
[ ] 7. npm run dev:client (klient check)
```

---

Więcej szczegółów w [`README.md`](README.md) i [`docs/MODULES.md`](docs/MODULES.md).
