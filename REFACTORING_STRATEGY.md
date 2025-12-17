# REFACTORING STRATEGY - Mapa Drogowa Refaktoryzacji Modułów

**Data**: 2025-12-16
**Status**: Strategia Opracowana
**Cel**: Systematyczna refaktoryzacja modułów Renia wg SOLID principles

---

## 1. RANKING PRIORYTETÓW - TOP 5 NARUSZENIA SOLID

### 🔴 TIER 1: CRITICAL (Największy wpływ, wysokie ryzyko)

#### **1.1 Renia-Cart Module: MASSIVE Code Duplication (SRP Violation)**
- **Problem**: 3 komponenty (AddToCartButton, ProductAddToCartPanel, SimpleAddToCartIcon) duplikują 100% logiki
  - useState, error handling, toast messages, loading state, manager, i18n
- **Impact**:
  - Zmiana w logice cart wymagałaby edycji 3 plików
  - Błędy poprawiane wielokrotnie
  - Testowanie wymaga 3x tego samego testu
- **Effort**: 4-5 godzin
- **Benefit**: 30-40% redukcja kodu, lepsha maintainability
- **Refactoring Plan**:
  1. Wydziel hook `useAddToCart()` z wspólną logiką
  2. Stwórz interfejs `IAddToCartPresenter` dla różnych prezentacji
  3. Redukuj komponenty do pure presentational

---

#### **1.2 Magento-Category: CategoryMainMenu - God Component (SRP Violation)**
- **Problem**: Jeden komponent z 6 odpowiedzialnościami (137 linii kodu):
  - Konfiguracja (readEndpoint, readRootCategoryId)
  - Pobieranie danych (fetchMenu)
  - State management (loading/error)
  - Rendering hierarchii (renderTree z rekurencją)
  - Cache management (globalThis.__RENIA_MENU_CACHE__)
  - Error handling
- **Impact**:
  - Niemożliwe testowanie pojedynczych aspektów
  - Zmiana cache strategy wymaga refaktoringu komponenty
  - Zmiana struktury drzewa wymaga edycji rendering logic
- **Effort**: 5-6 godzin
- **Benefit**: Komponent staje się 50% krótszy, testable, elastyczny
- **Refactoring Plan**:
  1. Wydziel `IMenuService` interface
  2. Stwórz `MenuCacheStrategy` abstraction
  3. Ekstrakcja `renderTree` do osobnego serwisu
  4. Uproszczenie komponenty do pure presentational

---

#### **1.3 Magento-Cart: DIP Violation - Tight Coupling to Concrete Dependencies**
- **Problem**: Komponenty bezpośrednio zależne od:
  - `useCartManager()` (konkretna implementacja)
  - `useToast()` z renia-ui-toast
  - `useI18n()` z renia-i18n
  - cartStateSync.ts bezpośrednio `dispatch` na store
- **Impact**:
  - Niemożliwe mockowanie w testach
  - Zmiana toast library wymaga zmian w 3+ komponentach
  - Tight coupling utrudnia reuse w innych kontekstach
- **Effort**: 3-4 godzin
- **Benefit**: Komponenty stają się testowalne, reusable, komposable
- **Refactoring Plan**:
  1. Stwórz interfejsy: `INotificationService`, `ILocalizationService`
  2. Wydziel `CartDependencies` container
  3. Implementuj Dependency Injection pattern
  4. Mockuj w testach

---

### 🟠 TIER 2: HIGH (Znaczący wpływ, średnie ryzyko)

#### **2.1 Magento-Category: Duplikacja Mapperów (OCP Violation)**
- **Problem**: Identyczne mapowanie w dwóch miejscach:
  - `menu.ts`: mapNodesToMenu() → MenuItem
  - `categoryMapper.ts`: mapCategoryNode() → Category
  - Linia po linii: `id: String(node.uid ?? node.id ?? node.name ?? Math.random())`
- **Impact**:
  - Zmiana struktury UID wymaga edycji obu plików
  - Niż consistency między menu i kategorią
  - Łatwe jest zapomnieć o jednym mapperze
- **Effort**: 2-3 godzin
- **Benefit**: Single source of truth, łatwejsze zmiany, consistency
- **Refactoring Plan**:
  1. Stwórz `BaseNodeMapper` z wspólną logiką
  2. Oba mapery dziedziczą i specjalizują się
  3. Testy dla mappera w jednym miejscu

---

#### **2.2 Magento-Catalog + Magento-Catalog-Search: God Hook (SRP Violation)**
- **Problem**: `useProductListing` robi zbyt wiele:
  - State management (products, filters, sort, page)
  - Sort transformation
  - Pagination logic
  - API fetch + error handling
  - Criteria building (callback pattern)
- **Impact**:
  - Hook ma 200+ linii
  - Testowanie wymaga mockowania GraphQL
  - Zmiana paginacji wpływa na cały hook
  - Niemożliwe użycie części funkcjonalności
- **Effort**: 6-8 godzin
- **Benefit**: Hook rozszczepiony na 3-4 mniejsze, testowalne
- **Refactoring Plan**:
  1. Wydziel `useProductListingState` (state management)
  2. Wydziel `useProductListingSort` (sort logic)
  3. Wydziel `useProductListingPagination` (pagination)
  4. Główny hook komponuje je razem

---

#### **2.3 Magento-Configurable-Product: Interface Segregation (ISP Violation)**
- **Problem**: `ConfigurableProductOptions` przyjmuje redundantne props:
  - Gdy parent dostarcza state (selectedOptions, selectOption) - hook jest ignorowany
  - Gdy brakuje propsów - hook się uruchamia
  - Komponenty nie wiedzą, który path będzie wybrany
- **Impact**:
  - Duplikacja logiki selection
  - Niejasnościowe API
  - Trudne do testowania
- **Effort**: 2-3 godzin
- **Benefit**: Czysty, jasny API
- **Refactoring Plan**:
  1. Stwórz `ControlledConfigurableOptions` (z propsami)
  2. Stwórz `UncontrolledConfigurableOptions` (z hookiem)
  3. Główny komponent robi routing

---

#### **2.4 Magento-Product: ProductTile - Zbyt Wiele Odpowiedzialności (SRP Violation)**
- **Problem**: ProductTile robi wszystko:
  - Układ (image, name, price)
  - Rendering ceny (price + priceOriginal)
  - Slot rendering (product-listing-actions)
  - Importuje ProductAddToCartResolver
- **Impact**:
  - Komponent ma 60+ linii
  - Niski reusability
  - Zmiana layoutu wpływa na całą logikę
- **Effort**: 3-4 godzin
- **Benefit**: Komponenty atomowe, reusable
- **Refactoring Plan**:
  1. Wydziel `ProductImage` komponent
  2. Wydziel `ProductPrice` komponent
  3. Wydziel `ProductActions` komponent
  4. ProductTile staje się wrapper/compositor

---

### 🟡 TIER 3: MEDIUM (Umiarkowany wpływ)

#### **3.1 Magento-Category: CategoryRepository - God Service (SRP Violation)**
- **Problem**: Repository mieszanie query building z execution
- **Effort**: 2-3 godzin
- **Benefit**: Separacja concerns, testability
- **Refactoring Plan**:
  1. Wydziel `CategoryQueryBuilder`
  2. Wydziel `CategoryResponseMapper`
  3. Repository komponuje

---

#### **3.2 Magento-Product: Słabe Typowanie ProductInterface (ISP Violation)**
- **Problem**: Brakuje union types dla produktów
- **Effort**: 2-3 godzin
- **Benefit**: Type safety, predictability
- **Refactoring Plan**:
  1. Stwórz `SimpleProduct`, `ConfigurableProduct` types
  2. ProductInterface = SimpleProduct | ConfigurableProduct | ...
  3. Aktualizuj wszystkie componenty

---

#### **3.3 Magento-Configurable-Product: DIP Violation - OptionSelector Coupling**
- **Problem**: OptionSelector zależy od SwatchButton/DropdownSelector
- **Effort**: 2-3 godzin
- **Benefit**: Elastyczne renderery opcji
- **Refactoring Plan**:
  1. Stwórz `IOptionRenderer` interface
  2. OptionSelector wybiera renderer wg strategii

---

---

## 2. MATRYCA PRIORYTETÓW

| Nr | Moduł | Naruszenie | Impact | Effort | Ratio | Priority |
|----|-------|-----------|--------|--------|-------|----------|
| 1.1 | cart | SRP (Code Duplication) | 40% | 4-5h | 10:1 | 🔴 FIRST |
| 1.2 | category | SRP (God Component) | 35% | 5-6h | 7:1 | 🔴 FIRST |
| 1.3 | cart | DIP (Tight Coupling) | 30% | 3-4h | 10:1 | 🔴 FIRST |
| 2.1 | category | OCP (Mapper Duplication) | 20% | 2-3h | 10:1 | 🟠 2ND |
| 2.2 | catalog | SRP (God Hook) | 25% | 6-8h | 4:1 | 🟠 2ND |
| 2.3 | config-prod | ISP (Redundant Props) | 15% | 2-3h | 7:1 | 🟠 2ND |
| 2.4 | product | SRP (ProductTile) | 15% | 3-4h | 5:1 | 🟠 2ND |

**Ratio** = Impact / Effort (wyżej = lepiej)

---

## 3. FAZY REFAKTORYZACJI

### Faza 1: Foundation (1-2 tygodnie)
**Cel**: Ustabilizuj core abstractions
- ✅ `renia-graphql-client` (już kompletna z TIER 1)
- 🎯 `magento-cart` - wydziel `useAddToCart` hook (4-5h)
- 🎯 `magento-category` - rozłóż CategoryMainMenu (5-6h)
- 🎯 `magento-cart` - DIP refactor (3-4h)

**Koszt**: ~15 godzin
**Benefit**: Stabilna architektura, łatwiej się pracuje

---

### Faza 2: Scalability (2-3 tygodnie)
**Cel**: Przygotuj moduły do rozszerzenia
- 🎯 `magento-catalog` - rozłóż `useProductListing` (6-8h)
- 🎯 `magento-configurable-product` - ISP refactor (2-3h)
- 🎯 `magento-product` - ProductTile composition (3-4h)
- 🎯 `magento-category` - Mapper consolidation (2-3h)

**Koszt**: ~15-18 godzin
**Benefit**: Moduly stają się elastyczne i reusable

---

### Faza 3: Polish (1 tydzień)
**Cel**: Finalne ulepszenia
- 🎯 `magento-product` - Product type union types (2-3h)
- 🎯 `magento-configurable-product` - OptionRenderer strategy (2-3h)
- 🎯 `magento-category` - CategoryRepository separation (2-3h)
- 📖 Dokumentacja, migration guide

**Koszt**: ~8-10 godzin
**Benefit**: High-quality, polished codebase

---

## 4. KORZYŚCI KOŃCOWE

### Po Fazie 1: Foundation
- ✅ Kod cart jest DRY (30-40% mniej kodu)
- ✅ CategoryMainMenu jest testowalne
- ✅ Łatwiejsze debugowanie

### Po Fazie 2: Scalability
- ✅ Catalog hook jest elastyczny
- ✅ ConfigurableProduct ma czysty API
- ✅ ProductTile jest atomowy i reusable

### Po Fazie 3: Polish
- ✅ Type-safe product system
- ✅ Strategia dla opcji
- ✅ Pełna dokumentacja

### Metryki:
- 📉 Redukcja duplikacji kodu: 30-40%
- 📈 Testability: +50% (znacznie więcej funkcji testowalne)
- 🔧 Maintainability: +60% (znacznie łatwiej dodawać nowe funkcje)
- ⚡ Development velocity: +30% (mniej bugów, szybciej debugowanie)

---

## 5. PLAN AKCJI - NASTĘPNE KROKI

### Opcja A: Szybka refaktoryzacja (Quick Wins)
1. Start z cart module (1.1 + 1.3) - najwyższy ratio, krótko
2. Potem category (1.2 + 2.1) - god component + duplicated mappers
3. Finish with catalog (2.2) - największy hook

**Timeline**: 2-3 tygodnie

### Opcja B: Systematyczna (Full)
1. Realizuj Fazę 1 (Foundation) - 2 tygodnie
2. Realizuj Fazę 2 (Scalability) - 2-3 tygodnie
3. Realizuj Fazę 3 (Polish) - 1 tydzień

**Timeline**: 5-6 tygodni

### Opcja C: Minimalna (Low-Risk)
1. Start z kategorią (1.2) - izolowany moduł
2. Potem cart (1.1) - core module, ale nie zależy od nieco
3. Skip catalog na razie

**Timeline**: 1-2 tygodnie

---

## 6. PRZYKŁAD: Cart Module Refactoring

### PRZED (Code Duplication):
```typescript
// AddToCartButton.tsx
const [adding, setAdding] = useState(false);
const toast = useToast();
const manager = useCartManager();
const { t } = useI18n();

const handleAdd = async () => {
  setAdding(true);
  try {
    await manager.add(product);
    toast.success(t('cart.added'));
  } catch (err) {
    toast.error(t('cart.error'));
  } finally {
    setAdding(false);
  }
};

// ... identyczne w ProductAddToCartPanel.tsx i SimpleAddToCartIcon.tsx
```

### PO (Extracted Hook):
```typescript
// useAddToCart.ts
export const useAddToCart = () => {
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  const manager = useCartManager();
  const { t } = useI18n();

  const add = async (product: Product) => {
    setAdding(true);
    try {
      await manager.add(product);
      toast.success(t('cart.added'));
    } catch (err) {
      toast.error(t('cart.error'));
    } finally {
      setAdding(false);
    }
  };

  return { adding, add };
};

// AddToCartButton.tsx - znacznie mniejszy
const AddToCartButton: FC<Props> = ({ product }) => {
  const { adding, add } = useAddToCart();
  return <button onClick={() => add(product)} disabled={adding} />;
};
```

---

## 7. COMMITOWANIE I MILESTONE'I

### Milestone 1: Cart Module
- Commit: "Refactor: Extract useAddToCart hook - eliminuje duplikację (3 komponenty)"
- Commit: "Refactor: DIP - introduce CartDependencies container"
- Tests: Unit tests dla hook'a + integration tests dla komponentów

### Milestone 2: Category Module
- Commit: "Refactor: Split CategoryMainMenu into smaller concerns"
- Commit: "Refactor: Consolidate node mappers (menu + category)"
- Tests: Unit tests dla każdego service

### itd.

---

## 8. FAQ I COMMON QUESTIONS

**Q: Czy mogę robić to inkrementacyjnie?**
A: Tak! Każdy milestone jest niezależny. Rób je w dowolnej kolejności.

**Q: Czy to będzie breaking change?**
A: Nie. Wszystkie refaktory można zrobić backward-compatible. Stare API nadal działa.

**Q: Ile to zajmie?**
A: Faza 1 (~15h) = 2-3 dni intensywnie. Faza 2+3 = dodatkowe 1-2 tygodnie.

**Q: Od czego zacząć?**
A: Rekomendacja: Cart module (1.1 + 1.3). Najwyższy ROI, izolowany moduł.

---

**Status**: Gotowy do implementacji
**Dalsze kroki**: Wybierz fazę i milestone. Zaczynam z najwyższym priority (1.1 Cart Module)?
