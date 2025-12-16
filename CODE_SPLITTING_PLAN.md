# Code Splitting Plan - Bundle per Route

## Cel

Zmniejszyć rozmiar bundle'u klienta przez załadowanie **TYLKO** komponentów potrzebnych dla danej ścieżki.

**Efekt:**
- Zmniejszenie bundle'u ~ 40-60% na średnią stronę
- Szybsze hydratowanie (mniej kodu do załadowania)
- Szybka nawigacja (nowe komponenty ładują się lazy)

---

## Architektura Current State

### SSR (Server-Side)
```
Request: /category/men
    ↓
1. loadRoutesRegistry() → [`/category/*`, `/product/:id`, ...]
2. matchPath('/category/men') → Znaleźliśmy route: '/category/*'
3. loadInterceptors('default', api)
4. loadInterceptors('category', api)  ← Specificzny kontekst!
5. Komponenty rejestrują się via api.layout.get().add() (hierarchiczny system)
6. Bootstrap zawiera slots/subslots dla tej ścieżki
7. HTML serializeduje bootstrap do window.__APP_BOOTSTRAP__
```

### CSR (Client-Side) - PROBLEM
```
Bootstrap received (window.__APP_BOOTSTRAP__)
    ↓
src/client/index.tsx
    ↓
import 'renia-magento-cart/registerComponents'           // Cały moduł
import 'renia-magento-wishlist/registerComponents'       // Cały moduł
import 'renia-magento-configurable-product/registerComponents'  // Cały moduł
import 'renia-magento-category/registerComponents'       // Cały moduł
... (wszystkie enabled moduły)
    ↓
ONE BUNDLE: dist/public/index.js (1.5MB + 2.5MB map)
    ↓
Hydrate AppRoot
```

---

## Rozwiązanie: Route-Aware Code Splitting

### 1. Mapowanie Route → Moduły

**Struktura:** Każdy route wie jakie moduły musi załadować.

```typescript
// Przykłady:
/category/*          → Potrzebne: ['renia-magento-catalog', 'renia-magento-cart', 'renia-magento-wishlist']
/product/:urlKey     → Potrzebne: ['magento-product', 'renia-magento-cart', 'renia-magento-configurable-product-cart']
/cart                → Potrzebne: ['renia-magento-cart']
/search              → Potrzebne: ['renia-magento-catalog-search', 'renia-magento-cart']
/wishlist            → Potrzebne: ['renia-magento-wishlist']
```

**Gdzie przechowywać?** W `routes.ts` każdego modułu!

```typescript
// magento-product/routes.ts
export default [
  {
    path: '/product/:urlKey',
    componentPath: 'magento-product/pages/ProductPage',
    handler: 'magento-product/routeHandler',
    priority: 40,
    layout: '1column',
    requiredModules: [      // ← NOWE POLE
      'magento-product',
      'renia-magento-cart',
      'renia-magento-configurable-product',
      'renia-magento-configurable-product-cart'
    ]
  }
];
```

### 2. SSR: Detectaj route i oblicz requiredModules

```typescript
// src/server/index.tsx

app.get('*', async (req, res) => {
  const routes = await loadRoutesRegistry({ configPath });
  const match = routes.find(r => matchPath({ path: r.path, end: false }, req.path));

  // Oblicz moduły dla tej ścieżki
  const requiredModules = match?.requiredModules ?? [];

  // Dodaj do bootstrap
  const bootstrap = {
    routes: [...],
    slots: {...},
    subslots: {...},
    requiredModules,  // ← Lista modułów dla klienta
    config: {...}
  };

  // Serializuj bootstrap z requiredModules
  const html = htmlTemplate({ appHtml, bootstrap });
  res.send(html);
});
```

### 3. CSR: Załaduj dynamicznie tylko potrzebne moduły

```typescript
// src/client/index.tsx - NEW APPROACH

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRoot from '@framework/runtime/AppRoot';

declare global {
  interface Window {
    __APP_BOOTSTRAP__?: any;
  }
}

// Mapa: module name → dynamic import
const moduleLoaders = {
  'renia-magento-cart': () => import('renia-magento-cart/registerComponents'),
  'renia-magento-wishlist': () => import('renia-magento-wishlist/registerComponents'),
  'renia-magento-category': () => import('renia-magento-category/registerComponents'),
  'magento-product': () => import('magento-product/registerComponents'),
  'renia-magento-catalog': () => import('renia-magento-catalog/registerComponents'),
  'renia-magento-catalog-search': () => import('renia-magento-catalog-search/registerComponents'),
  'renia-magento-configurable-product': () => import('renia-magento-configurable-product/registerComponents'),
  'renia-magento-configurable-product-cart': () => import('renia-magento-configurable-product-cart/registerComponents'),
  'renia-magento-wishlist': () => import('renia-magento-wishlist/registerComponents'),
  'renia-ui-toast': () => import('renia-ui-toast/registerComponents'),
  'renia-magento-cart-sidebar': () => import('renia-magento-cart-sidebar/registerComponents'),
  'renia-i18n': () => import('renia-i18n/registerComponents'),
  'renia-layout': () => import('renia-layout/registerComponents')
};

// Funkcja załadowania modułów
const loadRequiredModules = async (moduleNames: string[]) => {
  const loaders = moduleNames
    .map(name => moduleLoaders[name])
    .filter(Boolean);

  await Promise.all(loaders.map(loader => loader()));
};

const rootElement = document.getElementById('root');
const bootstrap = window.__APP_BOOTSTRAP__ ?? { routes: [], slots: {}, requiredModules: [] };

// Załaduj moduły przed hydratacją
(async () => {
  // 1. Załaduj TYLKO moduły dla tej ścieżki
  await loadRequiredModules(bootstrap.requiredModules);

  // 2. Załaduj strategie produktów (zawsze potrzebne jako fallback)
  const { registerStrategies: registerCartStrategies } = await import('renia-magento-cart/registerStrategies');
  const { registerStrategies: registerConfigurableStrategies } = await import('renia-magento-configurable-product-cart/registerStrategies');
  registerCartStrategies();
  registerConfigurableStrategies();

  // 3. Hydratuj
  if (rootElement) {
    hydrateRoot(
      rootElement,
      <React.StrictMode>
        <BrowserRouter>
          <AppRoot bootstrap={bootstrap} runtime="client" />
        </BrowserRouter>
      </React.StrictMode>
    );
  }
})();
```

### 4. Client-Side Navigation: Lazy Load na zmianę route'u

```typescript
// src/framework/runtime/AppRoot.tsx - ZMIENIONY

const AppRoot: React.FC<AppRootProps> = ({ bootstrap }) => {
  const navigate = useNavigate();

  // Załaduj moduły gdy route się zmienił
  useEffect(() => {
    const currentRoute = bootstrap.routes.find(r => matchPath({path: r.path}, location.pathname));
    const requiredModules = currentRoute?.requiredModules ?? [];

    // Załaduj nowe moduły jeśli różne od poprzednich
    if (requiredModules.length > 0) {
      loadRequiredModules(requiredModules);
    }
  }, [location.pathname]);

  return (
    // ... render
  );
};
```

---

## Implementacja: Step by Step

### Faza 1: Dodaj requiredModules do route definitions

**Pliki do zmian:**

```
app/modules/renia/magento-product/routes.ts
app/modules/renia/magento-category/routes.ts
app/modules/renia/magento-catalog/routes.ts
app/modules/renia/magento-cart/routes.ts
app/modules/renia/magento-wishlist/routes.ts
app/modules/renia/magento-catalog-search/routes.ts
app/modules/renia/magento-cart-sidebar/routes.ts
```

**Zmiana w każdym:**

```typescript
// PRZED:
export default [
  {
    path: '/product/:urlKey',
    componentPath: 'magento-product/pages/ProductPage',
    handler: 'magento-product/routeHandler',
    priority: 40,
    layout: '1column'
  }
];

// PO:
export default [
  {
    path: '/product/:urlKey',
    componentPath: 'magento-product/pages/ProductPage',
    handler: 'magento-product/routeHandler',
    priority: 40,
    layout: '1column',
    requiredModules: [
      'magento-product',
      'renia-magento-cart',
      'renia-magento-configurable-product',
      'renia-magento-configurable-product-cart',
      'renia-magento-wishlist'
    ]
  }
];
```

### Faza 2: Modify src/server/index.tsx - Add requiredModules to bootstrap

```typescript
// Wokół linii 380-399

const bootstrap = {
  routes: routes.map(r => ({
    path: r.path,
    component: r.component,
    componentPath: r.componentPath,
    layout: (r.meta as any)?.layout ?? '1column',
    requiredModules: r.requiredModules ?? [],  // ← NOWE
    meta: r.path === match?.path ? routeMeta : r.meta ?? {}
  })),
  slots,
  subslots,
  layouts: layoutRegistry.layouts,
  layoutSlots: layoutRegistry.slots,
  config: {...}
};
```

### Faza 3: Modify src/client/index.tsx - Dynamic module loading

Zastąp statyczne importy dynamicznym załadowaniem (patrz wyżej).

### Faza 4: Update TypeScript types

```typescript
// app/etc/types.ts lub gdziekolwiek są Route typy

export type Route = {
  path: string;
  componentPath?: string;
  component?: string;
  handler?: string;
  priority?: number;
  layout?: string;
  meta?: Record<string, any>;
  requiredModules?: string[];  // ← NOWE
};
```

### Faza 5: (Opcjonalne) Update AppRoot dla lazy loading na navigację

Dodaj useEffect w AppRoot.tsx aby załadować nowe moduły na zmianę route'u.

---

## Bundle Structure - Przed i Po

### PRZED (Current):
```
dist/public/
├── index.js          (1.5MB) - zawiera KOD ZE WSZYSTKICH MODUŁÓW
├── index.js.map      (2.5MB)
└── chunks/
    ├── vendor-*.js   (shared libraries)
    └── ...
```

### PO (Code Splitting):
```
dist/public/
├── index.js                    (100KB) - ONLY bootstrap + AppRoot
├── index.js.map
├── modules/
│   ├── category.js            (250KB) - /category/* route
│   ├── product.js             (300KB) - /product/:id route
│   ├── cart.js                (200KB) - /cart route
│   ├── search.js              (180KB) - /search route
│   └── wishlist.js            (150KB) - /wishlist route
└── chunks/
    ├── vendor-*.js            (shared: react, router, etc)
    └── ...
```

**Savings:**
- Initial load: 1.5MB → 100KB + (250KB dla /category) = ~350KB ✅ 77% zmniejszenie
- /product: 100KB + 300KB = 400KB ✅ 73% zmniejszenie

---

## Challenges & Solutions

### Challenge 1: Module Dependencies
**Problem:** Moduł A zależy od modułu B. Jak uniknąć duplikacji kodu?

**Solution:** esbuild auto-deduplicuje shared code do chunks/vendor-*.js

### Challenge 2: Strategie produktów
**Problem:** Strategie muszą być dostępne ZAWSZE (zawsze mogą być produkty na stronie)

**Solution:** Rejestruj strategie w każdym moduł's registerStrategies.ts
- Będą załadowywane per module (nie duplikuj)
- System merge'a je automatycznie

### Challenge 3: Navigation między stronami
**Problem:** User naviguje z /category → /product. Czy moduły z category są usunięte z pamięci?

**Solution:** Nie musimy usuwać, JavaScript VM je zatrzyma. Ale możemy:
1. Załadować nowe (dodatkowe ~300KB na nową stronę)
2. Nie czyszczenie starych (pamiętaj: one już są bundled w vendor/)

**Best practice:** Załaduj nowe moduły ASYNC, nie blokuj hydratacji

### Challenge 4: Critical modules (muszą być zawsze)

```typescript
// Zawsze potrzebne na każdej stronie:
const CORE_MODULES = [
  'renia-layout',           // Layout shell
  'renia-i18n',            // i18n provider
  'renia-ui-toast',        // Toast notifications
  'renia-magento-cart-sidebar'  // Cart link w header
];

// Zawsze załaduj core modules
await loadRequiredModules([
  ...CORE_MODULES,
  ...bootstrap.requiredModules
]);
```

---

## Testing

### Weryfikacja bundla:

```bash
# 1. Build z code splitting
npm run build

# 2. Sprawdź rozmiary
ls -lh dist/public/

# Expected:
# index.js          100-200KB
# modules/
#   category.js     200-300KB
#   product.js      250-350KB
# chunks/vendor-*.js  600-800KB

# 3. Analiza z esbuild
# Dodaj `--analyze` flag do build-client.mjs
```

### Integration testing:

```bash
# 1. SSR
curl http://localhost:3000/category/men
# Sprawdź: window.__APP_BOOTSTRAP__.requiredModules powinien zawierać odpowiednie moduły

# 2. CSR Hydration
# Otwórz DevTools → Network
# Powinna załadować:
# - index.js (small)
# - modules/category.js (dla /category)
# - chunks/vendor-*.js

# 3. Navigation
# Click na /product
# Network tab powinien pokazać: modules/product.js being loaded
```

---

## Migration Timeline

1. **Krok 1** (teraz): Dodaj `requiredModules` do routes.ts w każdym module
2. **Krok 2**: Modify SSR aby passoval requiredModules w bootstrap
3. **Krok 3**: Modify CSR aby used dynamic imports
4. **Krok 4**: Test SSR + CSR
5. **Krok 5**: (Optional) Add lazy loading na client-side navigation

---

## Future Optimizations

- **Prefetching:** Prefetch moduły dla likely next routes
- **Service Worker:** Cache moduły na kliencie
- **HTTP/2 Server Push:** Push moduły razem z HTML
- **Module federation:** Dynamiczny import z CDN zamiast bundla

---

## References

- esbuild splitting: https://esbuild.github.io/api/#splitting
- Dynamic imports: https://javascript.info/modules-dynamic-imports
- Code splitting best practices: https://webpack.js.org/guides/code-splitting/
