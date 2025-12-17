# Dependency Injection - useAddToCart Hook

## Overview

`useAddToCart` hook obsługuje **opcjonalną Dependency Injection** dla testowania i loose coupling.

- **Produkcyjnie**: Automatycznie używa hooków React (useToast, useI18n, useCartManager)
- **W testach**: Można podać mock implementacje interfejsów

---

## SOLID Principles Implemented

### 1. Single Responsibility Principle (SRP)
- Hook odpowiada **TYLKO** za orchestrację dodawania do koszyka
- Konkretne implementacje (toast, i18n, cart) są w adapterach i serwisach

### 2. Open/Closed Principle (OCP)
- Można rozszerzyć nowe interfejsy bez modyfikacji hooka
- Np. dodać `IAnalyticsService` bez zmiany `useAddToCart`

### 3. Liskov Substitution Principle (LSP)
- Mock implementacje mogą zastępować rzeczywiste bez zmiany zachowania
- Interfejsy definiują kontrakt, który każda implementacja musi spełnić

### 4. Interface Segregation Principle (ISP)
- Interfejsy są minimalistyczne: `INotificationService`, `ILocalizationService`, `ICartService`
- Cada interfejs reprezentuje jedną odpowiedzialność

### 5. Dependency Inversion Principle (DIP) ✅ **NEW**
- Hook zależy od abstrakcji (interfejsów), nie od konkretnych implementacji
- Adaptery konwertują concrete hooks → interfejsy
- Umożliwia testowanie bez React test utils

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 useAddToCart Hook                        │
│         (uses interfaces, not concrete impl)             │
└────────┬──────────────────┬────────────────┬─────────────┘
         │                  │                │
         │ uses             │ uses           │ uses
         ▼                  ▼                ▼
    INotificationService ILocalizationService ICartService
         ▲                  ▲                ▲
         │ implements       │ implements     │ implements
         │                  │                │
    ┌────┴────┐        ┌────┴────┐      ┌────┴────┐
    │ Default │        │ Default │      │ Default │
    │ Adapter │        │ Adapter │      │ Adapter │
    └────┬────┘        └────┬────┘      └────┬────┘
         │                  │                │
         │ wraps            │ wraps          │ wraps
         ▼                  ▼                ▼
    useToast()          useI18n()      useCartManager()
    (React hook)        (React hook)    (React hook)

---

    ┌────────────────────────────────────────┐
    │         useAddToCart in Tests          │
    │  (receives mock implementations)       │
    └────────┬──────────────────┬────────────┘
             │                  │
             │ uses mocks       │ uses mocks
             ▼                  ▼
       MockNotification    MockLocalization
       MockCartService
```

---

## Interfaces

### INotificationService

```typescript
export interface INotificationService {
  success(options: { title: string; description: string }): void;
  error(options: { title: string; description: string }): void;
}
```

**Implementacje:**
- `createToastAdapter()` - Adapter dla renia-ui-toast (default)
- `MockNotificationService` - Mock dla testów

---

### ILocalizationService

```typescript
export interface ILocalizationService {
  translate(key: string, variables?: Record<string, any>): string;
  t(key: string, variables?: Record<string, any>): string;
}
```

**Implementacje:**
- `createI18nAdapter()` - Adapter dla renia-i18n (default)
- `MockLocalizationService` - Mock dla testów

---

### ICartService

```typescript
export interface ICartService {
  addProduct(options: { sku: string; quantity: number }): Promise<void>;
}
```

**Implementacje:**
- `createCartManagerAdapter()` - Adapter dla CartManagerContext (default)
- `MockCartService` - Mock dla testów

---

## Adapters

### toastAdapter.ts

```typescript
export function createToastAdapter(): INotificationService {
  const toast = useReniaToast();
  return {
    success({ title, description }) {
      toast({ tone: 'success', title, description });
    },
    error({ title, description }) {
      toast({ tone: 'error', title, description });
    }
  };
}
```

**Purpose:**
- Opakowuje `useToast()` do interfejsu `INotificationService`
- Umożliwia loose coupling między hook'iem a konkretną biblioteką toast

---

### i18nAdapter.ts

```typescript
export function createI18nAdapter(): ILocalizationService {
  const { t } = useReniaI18n();
  return {
    translate(key, variables) {
      return t(key, variables);
    },
    t(key, variables) {
      return t(key, variables);
    }
  };
}
```

**Purpose:**
- Opakowuje `useI18n()` do interfejsu `ILocalizationService`
- Umożliwia loose coupling między hook'iem a konkretną biblioteką i18n

---

### cartManagerAdapter.ts

```typescript
export function createCartManagerAdapter(): ICartService {
  const manager = useReniaCartManager();
  return {
    async addProduct({ sku, quantity }) {
      await manager.addProduct({ sku, quantity });
    }
  };
}
```

**Purpose:**
- Opakowuje `useCartManager()` do interfejsu `ICartService`
- Umożliwia loose coupling między hook'iem a konkretnym cart context'em

---

## Usage

### Production (bez DI - automatic defaults)

```typescript
// Komponenty używają hook'a bez podawania serwisów
// Hook automatycznie tworzy domyślne adaptery

const { adding, addToCart } = useAddToCart({
  product,
  quantity: 1,
  onSuccess: (product) => console.log('Added:', product),
});
```

**Flow:**
1. Hook tworzy default adaptery:
   - `useToastAdapter()` → INotificationService
   - `useI18nAdapter()` → ILocalizationService
   - `useCartManagerAdapter()` → ICartService

2. Hook używa domyślnych implementacji

3. Komponent renderuje bez zmian

---

### Testing (z DI - injected mocks)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { useAddToCart } from './useAddToCart';
import type { INotificationService, ILocalizationService, ICartService } from '../interfaces/services';

describe('useAddToCart with DI', () => {
  it('should call notification.success on successful add', async () => {
    // 1. Create mocks
    const mockNotification: INotificationService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    const mockLocalization: ILocalizationService = {
      translate: vi.fn((key) => key),
      t: vi.fn((key) => key),
    };

    const mockCart: ICartService = {
      addProduct: vi.fn().mockResolvedValue(undefined),
    };

    // 2. Inject mocks
    const { result } = renderHook(() =>
      useAddToCart({
        product: { sku: 'TEST-SKU', name: 'Test Product' } as ProductInterface,
        quantity: 1,
        notificationService: mockNotification,
        localizationService: mockLocalization,
        cartService: mockCart,
      })
    );

    // 3. Call addToCart
    await act(async () => {
      await result.current.addToCart();
    });

    // 4. Assert mocks were called correctly
    expect(mockCart.addProduct).toHaveBeenCalledWith({ sku: 'TEST-SKU', quantity: 1 });
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('should call notification.error on cart error', async () => {
    const mockNotification: INotificationService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    const mockCart: ICartService = {
      addProduct: vi.fn().mockRejectedValue(new Error('Out of stock')),
    };

    const { result } = renderHook(() =>
      useAddToCart({
        product: { sku: 'TEST-SKU' } as ProductInterface,
        cartService: mockCart,
        notificationService: mockNotification,
        localizationService: { t: vi.fn((key) => key) },
      })
    );

    await act(async () => {
      await result.current.addToCart();
    });

    expect(mockNotification.error).toHaveBeenCalled();
  });
});
```

---

## Benefits

### 1. **Testability**
```typescript
// Wcześniej: Trzeba mockować useToast, useI18n, useCartManager React hooks
// Teraz: Można podać zwykłe obiekty (nie React hooks)

const mockServices = {
  notificationService: { success: vi.fn(), error: vi.fn() },
  localizationService: { t: vi.fn() },
  cartService: { addProduct: vi.fn() },
};
```

### 2. **Loose Coupling**
```typescript
// Wcześniej: hook zależy od konkretnych implementacji
useToast() → zmieniamy renia-ui-toast? Musimy zmienić hook

// Teraz: hook zależy od interfejsów
INotificationService → można podmienić bez zmian w hook'u
```

### 3. **Extensibility**
```typescript
// Przykład: Chcemy dodać analitykę
interface IAnalyticsService {
  trackAddToCart(product: ProductInterface): void;
}

// Dodajemy nowy parametr w UseAddToCartOptions
cartService?: ICartService;

// Hook automatycznie obsługuje nowy serwis
```

### 4. **Backward Compatibility**
```typescript
// Stary kod nie zmienia się
const { adding, addToCart } = useAddToCart({ product });

// Nowy kod w testach może podać mocks
const { adding, addToCart } = useAddToCart({
  product,
  notificationService: mockNotif,
});
```

---

## Migration Path

### Phase 1 (Current): Interfaces + Adapters + Hook refactor
- ✅ Create interfaces
- ✅ Create adapters
- ✅ Refactor useAddToCart with optional DI
- ✅ Backward compatible (existing code works)

### Phase 2 (Future): Add comprehensive tests
- Write unit tests using DI mocks
- Replace React hook tests with integration tests

### Phase 3 (Future): Extend to other hooks
- Apply same pattern to other hooks (useAddToWishlist, etc.)
- Create central DI registry

---

## Performance Notes

### useMemo for Service Selection

```typescript
const notification = useMemo(
  () => injectedNotification ?? defaultNotification,
  [injectedNotification, defaultNotification]
);
```

**Why:**
- Prevents unnecessary re-renders if injected service changes
- Skips adapter creation if not needed
- Memoized throughout hook lifecycle

---

## Troubleshooting

### Issue: Mock not being called
**Check:**
- Mock implements full interface (all methods)
- Mock is passed to hook options
- Hook.current.addToCart() is being called with correct parameters

### Issue: Type errors with mocks
**Check:**
- Mock types match interface exactly
- No readonly properties missed
- vitest.fn() properly typed

---

## References

- **SOLID Principles**: See `/REFACTORING_STRATEGY.md`
- **useAddToCart Hook**: `/app/modules/renia/magento-cart/hooks/useAddToCart.ts`
- **Adapter Pattern**: https://refactoring.guru/design-patterns/adapter
- **Dependency Injection**: https://en.wikipedia.org/wiki/Dependency_injection
