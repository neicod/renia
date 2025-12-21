# Koncepcja: renia/magento-configurable-product

## Cel

Moduł dodaje obsługę produktów konfigurowalnych (configurable products) z Magento – produktów posiadających warianty (np. rozmiar, kolor). Użytkownik wybiera opcje konfiguracyjne (color=Blue, size=Large), system znajduje odpowiedni wariant, aktualizuje cenę i obraz, a przy dodawaniu do koszyka przekazuje SKU dziecka (child product), nie rodzica.

## Zakres

- **Obsługa tylko configurable products** – proste produkty pozostają w gestii `renia-magento-product`.
- **Wprowadzenie `ProductInterface`** – w `renia-magento-product` należy utworzyć interfejs `ProductInterface` z polami wspólnymi dla wszystkich typów produktów. Typ `Product` (simple/virtual) i `ConfigurableProduct` będą implementować ten interfejs.
- **Osobny typ dla produktów konfigurowalnych** – `ConfigurableProduct` to osobny typ (nie rozszerzenie `Product`), implementujący `ProductInterface` z dodatkowymi polami: `configurableOptions`, `variants`.
- **Rozszerzenie przez augmentery** – GraphQL query augmenter dokłada pola konfiguracyjne do zapytań produktowych; komponenty używają type guard `isConfigurableProduct()` do rozróżnienia typów.
- **UI po stronie klienta** – wybór opcji renderowany jest po hydratacji; SSR dostaje strukturę danych, ale stan wyboru jest zawsze pustym obiektem na starcie.
- **Integracja przez interceptory** – UI dodawania do koszyka jest wybierane przez strategię produktu (`registerProductTypeComponentStrategy` dla `key: 'add-to-cart-button'`) i renderowane w outlecie `actions` hosta PDP (ProductDetails) przez `ProductAddToCartResolver`.

---

## Składniki

### Typy

#### Modyfikacja w `renia-magento-product/types.ts`

- **`ProductInterface`** – nowy interfejs bazowy dla wszystkich typów produktów:
  ```typescript
  export interface ProductInterface {
    id: string;
    sku: string;
    name: string;
    urlKey?: string;
    urlPath?: string;
    thumbnail?: ProductMedia;
    price?: ProductPrice;
    priceOriginal?: ProductPrice;
    __typename: string;
  }
  ```

- **`Product`** – aktualny typ zmienia się na implementację `ProductInterface`:
  ```typescript
  export type Product = ProductInterface & {
    __typename: 'SimpleProduct';
  }
  ```

#### Typy w `renia/magento-configurable-product/types.ts`

- **`SwatchData`** – dane swatch dla wizualnej prezentacji:
  ```typescript
  export type SwatchData = {
    type: 'COLOR' | 'IMAGE' | 'TEXT';
    value: string; // hex color, image URL, or text
  };
  ```

- **`ConfigurableOptionValue`** – konkretna wartość opcji (np. „Blue", „Large"):
  ```typescript
  export type ConfigurableOptionValue = {
    valueIndex: number;
    label: string;
    swatchData?: SwatchData;
    useDefaultValue?: boolean;
  };
  ```

- **`ConfigurableOption`** – opcja konfiguracyjna (np. „Color", „Size"):
  ```typescript
  export type ConfigurableOption = {
    attributeId: string;
    attributeCode: string;
    label: string;
    position: number;
    values: ConfigurableOptionValue[];
  };
  ```

- **`VariantAttribute`** – atrybut wariantu (para attributeCode → valueIndex):
  ```typescript
  export type VariantAttribute = {
    code: string;
    valueIndex: number;
    label: string;
  };
  ```

- **`ConfigurableVariant`** – wariant/dziecko produktu:
  ```typescript
  export type ConfigurableVariant = {
    product: {
      id: string;
      sku: string;
      name: string;
      thumbnail?: ProductMedia;
      price?: ProductPrice;
      stockStatus?: 'IN_STOCK' | 'OUT_OF_STOCK';
    };
    attributes: VariantAttribute[];
  };
  ```

- **`ConfigurableProduct`** – osobny typ implementujący `ProductInterface`:
  ```typescript
  import type { ProductInterface } from 'renia-magento-product/types';

  export type ConfigurableProduct = ProductInterface & {
    __typename: 'ConfigurableProduct';
    configurableOptions: ConfigurableOption[];
    variants: ConfigurableVariant[];
  };
  ```

- **Type guard** – `isConfigurableProduct(product: ProductInterface): product is ConfigurableProduct` sprawdza `product.__typename === 'ConfigurableProduct'`.

### Augmenter zapytań (`services/configurableQueryAugmenter.ts`)

- **`registerConfigurableAugmenter()`** – rejestruje globalny augmenter przez `registerGraphQLQueryAugmenter()`.
- Dla zapytań `operationId?.startsWith('magentoProduct.')` dokłada do `['products', 'items']` pola:
  - `__typename` (identyfikacja typu produktu)
  - `configurable_options` (attributeId, attributeCode, label, position, values z value_index, label, swatch_data)
  - `variants` (product z id, sku, name, small_image, price_range, stock_status; attributes z code, value_index, label)
- Dzięki temu każde zapytanie o produkty automatycznie pobiera dane konfiguracyjne dla produktów, które je mają.

### Mapper (`services/configurableMapper.ts`)

- **`mapConfigurableProduct(item)`** – zwraca `ConfigurableProduct | null`.
  - Sprawdza `item.__typename === 'ConfigurableProduct'`.
  - Mapuje wspólne pola `ProductInterface` (id, sku, name, urlKey, thumbnail, price, priceOriginal, __typename).
  - Dodaje `configurableOptions` i `variants` przez pomocnicze `mapConfigurableOptions()` i `mapVariants()`.
  - **Nie używa** `mapProduct()` z `renia-magento-product`, ponieważ `ConfigurableProduct` to osobny typ, nie rozszerzenie `Product`.
- Używane w komponentach przez type guard; produkty niepasujące zwracają `null`.

### Hook wyboru wariantu (`hooks/useConfigurableSelection.ts`)

- **`useConfigurableSelection(product)`** – zarządza stanem wybranych opcji (`selectedOptions: Record<attributeCode, valueIndex>`).
- **Zwraca:**
  - `selectedOptions` – aktualny wybór użytkownika.
  - `currentVariant` – wariant dopasowany do `selectedOptions` (lub `null`, jeśli nie wszystkie opcje wybrane lub kombinacja nieistniejąca).
  - `availableOptions` – `Record<attributeCode, Set<valueIndex>>` z wartościami dostępnymi dla aktualnego kontekstu (filtrowane wg dostępnych wariantów).
  - `selectOption(attributeCode, valueIndex)` – aktualizuje wybór opcji.
  - `isOptionDisabled(attributeCode, valueIndex)` – sprawdza, czy wartość jest niedostępna (nie ma wariantu z tym valueIndex przy aktualnych wyborach).
  - `reset()` – zeruje wybór.
- **Logika dopasowania wariantu:**
  - Jeśli nie wszystkie `attributeCode` mają wybrane `valueIndex` → `currentVariant = null`.
  - Jeśli wszystkie wybrane → szuka wariantu, dla którego `variant.attributes` pasują do `selectedOptions`.

### Komponenty UI

1. **`ConfigurableProductOptions`** (`components/ConfigurableProductOptions.tsx`)
   - Główny orkiestrator wyboru opcji.
   - Renderuje `OptionSelector` dla każdej opcji (posortowane po `position`).
   - Wywołuje `onVariantChange(variantSku | null)` przy zmianie wariantu.
   - Opcjonalnie pokazuje `SelectedVariantSummary` (wybrane opcje i cenę).

2. **`OptionSelector`** (`components/OptionSelector.tsx`)
   - Wybór pojedynczej opcji (np. „Color").
   - Wykrywa, czy opcja ma `swatchData` → renderuje `SwatchButton` (przyciski z kolorem/obrazem).
   - W przeciwnym razie → `DropdownSelector` (select dla tekstu).
   - Przekazuje `isValueDisabled(valueIndex)` do elementów potomnych.

3. **`SwatchButton`** (`components/SwatchButton.tsx`)
   - Przycisk wyboru dla opcji wizualnych (kolor, obraz).
   - Kolor tła ustawiany przez `swatchData.value` (hex).
   - Stan `selected`/`disabled` wpływa na wygląd (border, opacity).

4. **`DropdownSelector`** (`components/DropdownSelector.tsx`)
   - `<select>` z opcjami tekstowymi.
   - Wartości niedostępne (`disabled`) są zaznaczone jako `<option disabled>`.

5. **`ConfigurableProductPrice`** (`components/ConfigurableProductPrice.tsx`)
   - Wyświetla cenę wariantu (jeśli wybrany) lub zakres cen (`min - max`).
   - Oblicza zakres z `product.variants.map(v => v.product.price.value)`.

6. **`ConfigurableAddToCartPanel`** (`components/ConfigurableAddToCartPanel.tsx`)
   - Zastępuje domyślny `ProductAddToCartPanel` dla produktów konfigurowalnych.
   - Renderuje `ConfigurableProductOptions` + input quantity + przycisk „Dodaj do koszyka".
   - Waliduje, czy `currentVariant` istnieje – jeśli nie, toast + blokada przycisku.
   - Przy submit: `manager.addProduct({ sku: currentVariant.product.sku, quantity: qty })` – przekazuje SKU **dziecka**, nie rodzica.

### Serwisy opcjonalne

- **`variantSelectionStorage`** (`services/variantSelectionStorage.ts`) – opcjonalny cache wyboru w `browserStorage` (TTL 30 min).
  - `read(productId)` / `write(productId, selectedOptions)` / `clear()`.
  - Użycie: hook `useConfigurableSelection` może inicjalizować stan z cache po hydratacji.

---

## Zależności

Deklarowane w `registration.js`:
- **`renia-magento-product`** – interfejs `ProductInterface`, typy pomocnicze (`ProductMedia`, `ProductPrice`).
- **`renia-graphql-client`** – `QueryBuilder` do budowania zapytań.
- **`renia-magento-graphql-client`** – `MagentoGraphQLRequestFactory` (tworzenie requestów).
- **`renia-magento-cart`** – `CartManagerProvider`, `useCartManager()` (dodawanie do koszyka).
- **`renia-ui-toast`** – `useToast()` (komunikaty o błędach/sukcesie).
- **`renia-i18n`** – `useI18n()` (tłumaczenia komunikatów).

Runtime (nie deklarowane):
- **`@framework/api/graphqlClient`** – `registerGraphQLQueryAugmenter()` (rejestracja augmentera).
- **`@framework/storage/browserStorage`** – opcjonalny cache wyboru.

---

## Integracje

### Sloty i interceptory

- **`interceptors/default.ts`** – wywoływany globalnie; rejestruje `registerConfigurableAugmenter()` na starcie modułu, aby każde zapytanie produktowe dostawało pola konfiguracyjne.
- UI dodawania do koszyka jest wybierane przez strategię produktu (`registerProductTypeComponentStrategy` dla `key: 'add-to-cart-button'`). Hosty (listing/PDP) renderują `ProductAddToCartResolver` jako extension w outlecie `actions`.

### Przepływ danych

```
ProductPage → useProduct({ urlKey })
  ↓
productRepository.getList (augmenter dołożył pola configurable_options, variants)
  ↓
mapConfigurableProduct(item) → ConfigurableProduct
  ↓
ProductDetails → ExtensionsOutlet(host: ProductDetails, outlet: actions) → ProductAddToCartResolver → ConfigurableAddToCartPanel (strategia)
  ↓
useConfigurableSelection(product) → selectedOptions, currentVariant
  ↓
ConfigurableProductOptions → OptionSelector → SwatchButton/DropdownSelector
  ↓
user wybiera opcje → currentVariant zmienia się
  ↓
ConfigurableAddToCartPanel: submit → manager.addProduct({ sku: currentVariant.product.sku })
  ↓
cartRepository.addItems → GraphQL mutation addProductsToCart z SKU dziecka
```

### Augmenter GraphQL

- Moduł rejestruje augmenter dla `operationId: 'magentoProduct.*'`.
- Augmenter działa na `QueryBuilder`, dokłada pola do `['products', 'items']`.
- Nie modyfikuje innych zapytań (np. koszyk, kategorie).
- Produkty proste (`__typename: 'SimpleProduct'`) dostaną te same pola, ale będą puste (`configurable_options: []`, `variants: []`) – nie wpływa to na działanie.

### Koszyk

- `ConfigurableAddToCartPanel` używa `useCartManager()` z `renia-magento-cart`.
- **Ważne:** przekazuje SKU **wariantu** (dziecka), nie SKU rodzica. Magento rozpoznaje prosty produkt i dodaje go do koszyka.
- CartAPI w `renia-magento-cart` nie wymaga zmian – mutacja `addProductsToCart` przyjmuje SKU i quantity, co wystarcza dla prostych produktów (dzieci konfigurowalnych).

---

## Konwencje implementacyjne

1. **`ProductInterface` jako kontrakt bazowy.** W `renia-magento-product/types.ts` wprowadzamy `ProductInterface` z polami wspólnymi dla wszystkich typów produktów. `Product` (simple/virtual) i `ConfigurableProduct` to osobne typy implementujące ten interfejs (`ProductInterface & { ... }`). Komponenty przyjmują `ProductInterface` jako props i używają type guard `isConfigurableProduct(product)` do warunkowego renderowania.

2. **Augmenter działa globalnie.** Nie ma sensu selektywnie pobierać pola konfiguracyjne – augmenter dołożony jest do wszystkich zapytań `magentoProduct.*`. Dla prostych produktów pola są puste, więc overhead minimalny.

3. **Wybór wariantu tylko w kliencie.** SSR renderuje strukturę opcji, ale stan `selectedOptions` jest pusty. Hook `useConfigurableSelection` startuje z pustym stanem, dopiero klient wybiera opcje. Opcjonalnie można wczytać cache z `variantSelectionStorage` po hydratacji.

4. **Strategie per typ produktu.** `ConfigurableAddToCartPanel` jest strategią `add-to-cart-button` dla `ConfigurableProduct`, a dla `SimpleProduct` pozostaje domyślny panel/ikona. Host wywołuje `ProductAddToCartResolver`, który wybiera komponent po `product.__typename`.

5. **SKU dziecka, nie rodzica.** Kluczowa zasada: przy dodawaniu do koszyka przekazujemy `currentVariant.product.sku`, nie `product.sku`. Magento wymaga SKU prostego produktu (wariantu), nie SKU rodzica.

6. **Walidacja przed dodaniem.** Jeśli `currentVariant === null` (nie wszystkie opcje wybrane lub kombinacja nieistniejąca), przycisk „Dodaj do koszyka" jest zablokowany i pokazujemy komunikat (toast lub ostrzeżenie UI).

7. **Dostępność opcji.** Hook `availableOptions` filtruje wartości wg dostępnych wariantów. Jeśli użytkownik wybrał `color=Blue`, to `size` pokaże tylko rozmiary, dla których istnieje wariant `Blue + size`. Wartości niedostępne są `disabled` w UI.

8. **Cache wyboru (opcjonalny).** `variantSelectionStorage` z TTL 30 min może zapamiętywać wybór użytkownika dla produktu. Użyteczne, gdy użytkownik wraca na PDP z historii – stan opcji jest odtworzony. Jeśli cache wygasł lub produkt inny, zwraca `null`.

9. **Pliki tłumaczeń.** Klucze `configurableProduct.*` w `i18n/en_US.json` i `pl_PL.json`. Przykłady:
   - `configurableProduct.price.range` – „Zakres cen"
   - `configurableProduct.cart.pleaseSelectOptions` – „Wybierz wszystkie opcje, aby dodać do koszyka"
   - `configurableProduct.cart.error.noVariant.title` – „Wymagany wybór"
   - `configurableProduct.option.selectValue` – „Wybierz :label"

10. **Zgodność z SOLID.** Warstwa zapytań (`configurableQueryAugmenter`), mapper (`configurableMapper`), logika wyboru (`useConfigurableSelection`), UI (`ConfigurableProductOptions`) i integracja z koszykiem (`ConfigurableAddToCartPanel`) są rozdzielone. Moduł nie ingeruje w kod `renia-magento-product` ani `renia-magento-cart` – korzysta z ich API (repository, CartManager, strategie per typ produktu).

---

## Struktura plików

```
app/modules/renia/magento-configurable-product/
├── package.json
├── registration.js
├── index.ts
├── types.ts
├── registerComponents.ts
├── components/
│   ├── ConfigurableProductOptions.tsx
│   ├── ConfigurableAddToCartPanel.tsx
│   ├── ConfigurableProductPrice.tsx
│   ├── OptionSelector.tsx
│   ├── SwatchButton.tsx
│   ├── DropdownSelector.tsx
│   └── SelectedVariantSummary.tsx
├── hooks/
│   └── useConfigurableSelection.ts
├── services/
│   ├── configurableQueryAugmenter.ts
│   ├── configurableMapper.ts
│   └── variantSelectionStorage.ts (opcjonalny)
├── interceptors/
│   ├── default.ts           # Rejestracja augmentera
│   └── product.ts           # Wstrzyknięcie panelu koszyka na PDP
├── i18n/
│   ├── en_US.json
│   └── pl_PL.json
└── docs/
    └── concept.md           # Ten dokument
```

---

## Testowanie

1. **Unit testy:**
   - `configurableMapper` – mapowanie odpowiedzi GraphQL.
   - `useConfigurableSelection` – logika dopasowania wariantu, filtrowanie dostępnych opcji.
   - Type guard `isConfigurableProduct`.

2. **Testy integracyjne:**
   - Augmenter dołożony do `QueryBuilder` w `magentoProduct.search` / `magentoProduct.detail`.
   - Wybór opcji → zmiana `currentVariant` → aktualizacja ceny.
   - Submit z koszykiem → poprawny SKU dziecka w mutacji `addProductsToCart`.

3. **Testy E2E:**
   - Wejście na PDP produktu konfigurowalnego → widoczne opcje (color, size).
   - Wybór opcji → cena i obraz aktualizowane.
   - Dodanie do koszyka → koszyk zawiera poprawny wariant.
   - Wariant out-of-stock → opcja zablokowana.
   - SSR → hydratacja → stan pustego wyboru → użytkownik wybiera → stan zaktualizowany.

---

## Scenariusze użycia

### Scenariusz 1: Standardowy wybór wariantu

1. Użytkownik wchodzi na PDP produktu konfigurowalnego (np. koszulka).
2. Widzi opcje: Color (Blue, Red), Size (S, M, L).
3. Wybiera Blue → Size pokazuje tylko rozmiary dostępne dla Blue (np. M, L; S jest out-of-stock).
4. Wybiera M → cena aktualizowana do ceny wariantu Blue/M, obraz zmienia się na obraz tego wariantu.
5. Klika „Dodaj do koszyka" → SKU dziecka (`SHIRT-BLUE-M`) trafia do koszyka.
6. Toast potwierdza dodanie.

### Scenariusz 2: Brak wybranego wariantu

1. Użytkownik wchodzi na PDP.
2. Widzi opcje, ale nic nie wybiera.
3. Przycisk „Dodaj do koszyka" jest zablokowany, widoczny komunikat „Wybierz wszystkie opcje".
4. Użytkownik wybiera tylko Color → przycisk nadal zablokowany.
5. Dopiero po wybraniu Size → przycisk aktywny.

### Scenariusz 3: Nieistniejąca kombinacja

1. Użytkownik wybiera Color=Red, Size=XL.
2. Hook nie znajduje wariantu dla tej kombinacji → `currentVariant = null`.
3. Przycisk zablokowany, komunikat o braku dostępności.
4. Użytkownik zmienia Size=L → wariant znaleziony, przycisk aktywny.

---

## Uwagi finalne

- **Brak wsparcia dla bundli, downloadable, grouped** – moduł obsługuje tylko configurable products. Inne typy produktów z opcjami wymagają osobnych modułów.
- **Brak custom options** – niestandardowe opcje (text input, date picker) nie są wspierane. Jeśli produkt konfigurowalny ma też custom options, należy rozszerzyć moduł o ich obsługę.
- **Placeholder dla obrazów** – jeśli wariant nie ma własnego `thumbnail`, używany jest obraz rodzica (fallback do `product.thumbnail`).
- **Stock status** – `ConfigurableVariant.product.stockStatus` jest pobierany, ale UI może go używać opcjonalnie (np. badge „Out of stock" przy opcji).
