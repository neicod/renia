# renia-layout

Moduł do zarządzania hierarchicznym layoutem strony. Dostarcza `LayoutTreeBuilder` API do budowania drzewa komponentów z root node'em `page`, gdzie każdy moduł może dodawać komponenty poprzez fluent API `api.layout.get().add()`.

## Hierarchia layoutu

```
page (root)
├── header
│   ├── control-menu (koszyk, logowanie, wishlist)
│   └── (inne elementy nagłówka)
├── content (główna zawartość strony)
├── left (lewy sidebar - filtry, kategorie)
├── footer (stopka)
└── global-overlay (toast'y, powiadomienia)
```

## API

### LayoutTreeBuilder

Główna klasa do budowania drzewa:

```typescript
import { LayoutTreeBuilder } from 'renia-layout';

const layoutTree = new LayoutTreeBuilder();

// Nawiguj po hierarchii i dodaj komponenty
layoutTree
  .get('header')
  .add('MyComponent', 'my-component-id', {
    sortOrder: { before: '-' },
    props: { variant: 'dark' }
  });

// Buduj drzewo (sortuje wszystkie węzły)
const tree = layoutTree.build();
```

### API.layout w interceptorach

Interceptory otrzymują `api.layout` jako `LayoutNodeAPI` od root node'a (`page`):

```typescript
// @env: mixed
// app/modules/<vendor>/<module>/interceptors/default.ts

export default (api) => {
  api.registerComponents?.({
    'module-name/components/MyComponent': MyComponent
  });

  // Dodaj komponent do header'a
  api.layout
    .get('header')
    .add('module-name/components/MyComponent', 'my-id', {
      sortOrder: { before: '-' }
    });

  // Dodaj do zagnieżdżonego slotu (header.control-menu)
  api.layout
    .get('page.header.control-menu')
    .add('module-name/components/CartIcon', 'cart', {
      sortOrder: { before: 'customer-status' }
    });
};
```

## Sortowanie komponentów

### Domyślnie (pierwszy element)
```typescript
{ sortOrder: { before: '-' } }
```

### Przed konkretnym komponentem
```typescript
{ sortOrder: { before: 'search-bar' } }
```

### Po konkretnym komponencie
```typescript
{ sortOrder: { after: 'menu' } }
```

**Zawsze** używaj `before` lub `after` z stringiem (nigdy numeryczne `priority`).

## Ścieżki hierarchii

Pełne ścieżki do elementów:
- `api.layout.get('page')` - root
- `api.layout.get('header')` - nagłówek (automatycznie `page.header`)
- `api.layout.get('page.header.control-menu')` - menu kontrolne
- `api.layout.get('content')` - główna zawartość
- `api.layout.get('left')` - lewy sidebar
- `api.layout.get('footer')` - stopka
- `api.layout.get('global-overlay')` - overlay

**Skrót:** jeśli ścieżka nie zaczyna się od `page.`, automatycznie prepend'uje `page.`

## Przykłady

### Dodanie menu do nagłówka

```typescript
export default (api) => {
  api.registerComponents?.({
    'mymodule/components/MainMenu': MainMenu
  });

  api.layout
    .get('header')
    .add('mymodule/components/MainMenu', 'main-menu');
};
```

### Dodanie przycisku do menu kontrolnego

```typescript
api.layout
  .get('page.header.control-menu')
  .add('mymodule/components/WishlistButton', 'wishlist-btn', {
    sortOrder: { before: '-' }
  });
```

### Dodanie filtrów do lewego sidebara

```typescript
api.layout
  .get('left')
  .add('mymodule/components/Filters', 'category-filters', {
    props: { showPriceRange: true }
  });
```

## Konwersja na płaskie sloty

Podczas SSR, hierarchiczne drzewo jest konwertowane na płaskie struktury `slots` i `subslots` dla kompatybilności z `LayoutShell`:

- Bezpośrednie dzieci root node'a → global slots (`header`, `content`, `left`, `footer`, `global-overlay`)
- Zagnieżdżone węzły → subsloty (np. `page.header.control-menu` → `subslots['page.header.control-menu']`)

Konwersja odbywa się automatycznie w `src/server/index.tsx`.

## Typy

```typescript
export type SortOrder = {
  before?: string;
  after?: string;
};

export type LayoutNode = {
  id: string;                      // Identyfikator węzła
  path: string;                    // Pełna ścieżka (np. 'page.header.control-menu')
  component?: React.ComponentType;
  componentPath?: string;
  props?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  sortOrder?: SortOrder;
  children: Map<string, LayoutNode>;
  parent?: LayoutNode;
};
```

