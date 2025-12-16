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
| `1column` | `renia-layout/layouts/1column` | Strony bez sidebara (login, wishlist, checkout) |
| `2columns-left` | `renia-layout/layouts/2columns-left` | Kategorie, produkty, wyszukiwarka (lewy sidebar) |
| `empty` | `renia-layout/layouts/empty` | Logowanie, rejestracja (bez headera/footera) |

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
      layout: 'renia-layout/layouts/1column',  // ← ZAWSZE pełna ścieżka
      type: 'my-page'
    }
  }
];
```

### Jak dodać nowy layout

1. Utwórz plik: `app/modules/renia/layout/layouts/mynewlayout.tsx`
2. Implementuj: `type LayoutProps = { slots, main, routeMeta }`
3. Zarejestruj w: `app/modules/renia/layout/interceptors/default.ts`

```typescript
// @env: mixed
// app/modules/renia/layout/layouts/mynewlayout.tsx

import React from 'react';

type LayoutProps = {
  slots: Record<string, React.ReactNode>;
  main: React.ReactNode;
  routeMeta?: Record<string, unknown>;
};

export default function MyNewLayout({ slots, main }: LayoutProps) {
  return (
    <div className="my-layout">
      <header>{slots.header}</header>
      <main>{slots.content}{main}</main>
      <footer>{slots.footer}</footer>
    </div>
  );
}
```

---

## Interceptory i sloty

### Główne sloty

| Slot | Gdzie | Zastosowanie |
|------|-------|--------------|
| `header` | W headerze | Menu, wyszukiwarka |
| `control-menu` | W headera (górna część) | Koszyk, logowanie, wishlist |
| `content` | Główny kontener | Listy produktów, filtry |
| `left` | Lewy sidebar | Filtry, kategorie |
| `footer` | Footer | Copyright, linki |
| `global-overlay` | Ponad wszystko | Powiadomienia, toast'y |

### Subsloty (zagnieżdżone)

| Slot | Właściciel | Zastosowanie |
|------|-----------|--------------|
| `product-listing-actions` | ProductTile (lista) | Przyciski akcji na tile'u |
| `product-view-actions` | ProductDetails (strona) | Przyciski na stronie produktu |

### Jak dodać komponent do slotu

```typescript
// @env: mixed
// app/modules/<vendor>/<module>/interceptors/default.ts

import { MyComponent } from '../components/MyComponent';
import type { InterceptorApi } from 'renia-interceptors';

export default (api: InterceptorApi) => {
  // 1. Zarejestruj komponent
  api.registerComponents?.({
    'module-name/components/MyComponent': MyComponent
  });

  // 2. Dodaj do slotu
  api.extension('content', {
    componentPath: 'module-name/components/MyComponent',
    id: 'my-component-id',
    priority: 20  // wyższa = wcześniej
  });
};
```

### Jak wyłączyć komponent z innego modułu

```typescript
api.extension('content', {
  id: 'unwanted-component-id',
  enabled: false
});
```

### Kontekst-specificzny interceptor

```typescript
// @env: mixed
// app/modules/<vendor>/<module>/interceptors/category.ts

export default (api: InterceptorApi) => {
  // Ten interceptor ładuje się tylko dla route'ów z contexts: ['category']
  api.extension('left', {
    componentPath: 'module-name/components/CategoryFilters',
    id: 'category-filters',
    priority: 10
  });
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

### ❌ "api.extension is not a function" (SSR)

**Przyczyna:** Interceptor ma `@env: browser`.

**Rozwiązanie:**
```typescript
// @env: mixed  ← Zmień to
export default (api: InterceptorApi) => { /* ... */ };
```

### ❌ "Failed to load layout: renia-layout/layouts/custom"

**Przyczyna:** Layout nie zarejestrowany w `renia-layout/interceptors/default.ts`.

**Rozwiązanie:**
```typescript
// app/modules/renia/layout/interceptors/default.ts
api.registerComponents?.({
  'renia-layout/layouts/custom': CustomLayout
});
```

### ❌ Slot nie renderuje się

**Sprawdź:**
1. Komponent zarejestrowany w `api.registerComponents()`?
2. Dodany do slotu przez `api.extension()`?
3. `@env: mixed`?

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
