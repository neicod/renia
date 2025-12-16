# useAddToCart Hook

## Cel

Enkapsulacja logiki dodawania produktów do koszyka. Eliminuje duplikację kodu między komponentami AddToCartButton, ProductAddToCartPanel, SimpleAddToCartIcon.

## Sygnatura

```typescript
type UseAddToCartOptions = {
  product: ProductInterface;
  quantity?: number;
  onSuccess?: (product: ProductInterface) => void;
  onError?: (error: Error, product: ProductInterface) => void;
};

type UseAddToCartReturn = {
  adding: boolean;
  addToCart: () => Promise<void>;
};

function useAddToCart(options: UseAddToCartOptions): UseAddToCartReturn;
```

## Parametry

### UseAddToCartOptions

- **product** (required): `ProductInterface` - Produkt do dodania
- **quantity** (optional): `number` - Ilość do dodania (domyślnie 1)
- **onSuccess** (optional): callback wywoływany po pomyślnym dodaniu
- **onError** (optional): callback wywoływany gdy dodanie się nie powiedzie

### UseAddToCartReturn

- **adding**: `boolean` - Stan ładowania (true podczas dodawania)
- **addToCart**: `() => Promise<void>` - Funkcja do dodania produktu

## Przykłady użycia

### Podstawowe użycie

```typescript
const MyComponent = ({ product }) => {
  const { adding, addToCart } = useAddToCart({ product });

  return (
    <button onClick={addToCart} disabled={adding}>
      {adding ? 'Dodawanie...' : 'Dodaj do koszyka'}
    </button>
  );
};
```

### Z niestandardową ilością

```typescript
const { adding, addToCart } = useAddToCart({
  product,
  quantity: 5
});
```

### Z callbackami

```typescript
const { adding, addToCart } = useAddToCart({
  product,
  quantity: 1,
  onSuccess: (product) => {
    console.log('Dodano:', product.name);
    // Redirect do koszyka, tracking, etc.
  },
  onError: (error, product) => {
    console.error('Błąd:', error.message);
    // Custom error handling
  }
});
```

## Zachowanie

1. **Success Path:**
   - Wysyła API call `manager.addProduct({ sku, quantity })`
   - Wyświetla toast success z `cart.toast.added.title` i `cart.toast.added.single`
   - Wywołuje `onSuccess` callback (jeśli podany)

2. **Error Path:**
   - Łapie błąd
   - Loguje do console
   - Wyświetla toast error z `cart.toast.error.title` i message z błędu lub `cart.toast.error.generic`
   - Wywołuje `onError` callback (jeśli podany)

3. **Loading State:**
   - `adding` jest `true` podczas całej operacji
   - `adding` wraca na `false` w `finally` bloku

## Dependencies

- `useToast` - ze `renia-ui-toast/hooks/useToast`
- `useI18n` - ze `renia-i18n/hooks/useI18n`
- `useCartManager` - z `../context/CartManagerContext`

## Backward Compatibility

Hook nie zmienia API żadnego istniejącego komponentu. Komponenty zachowują swoje Props interfaces i zachowanie biznesowe.

## Gdzie Używane

- `AddToCartButton` - do dodawania Simple produktów (nie ConfigurableProduct)
- `ProductAddToCartPanel` - panel dla opcjonalnych produktów
- `SimpleAddToCartIcon` - ikona dla listingu produktów

## Testing

Aby przetestować hook w unit testach, użyj mocków dla:
- `useToast`
- `useCartManager`
- `useI18n`

Przykład:

```typescript
const mockToast = jest.fn();
const mockManager = { addProduct: jest.fn() };
const mockI18n = { t: jest.fn((key) => key) };

// Mock hooki
jest.mock('renia-ui-toast/hooks/useToast', () => () => mockToast);
jest.mock('../context/CartManagerContext', () => ({
  useCartManager: () => mockManager
}));
jest.mock('renia-i18n/hooks/useI18n', () => () => mockI18n);

// Teraz renderuj komponenty i testuj
```

## Notatki

- Hook używa `useCallback` do memoizacji `addToCart` funkcji
- Obsługuje edge case gdy `product.sku` jest brakujący
- Obsługuje error handling z fallback messagesm
- Wpisanie typu dla errora pozwala na proper error handling w `onError` callback
