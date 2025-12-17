# PHASE 2: SOLID Refactoring - Product Listing & Configurable Product

**Status:** PLANNING
**Start Date:** 2025-12-17 (after Phase 1 completion)
**Target Completion:** 2025-12-26 (estimated)
**Total Effort:** 52-75 hours
**Priority:** HIGH - Blocks multiple modules and impacts overall maintainability

---

## Overview

Phase 2 focuses on **highest-impact refactoring targets** identified through SOLID analysis of 4 Magento modules:
- `magento-catalog` - God Hook (243 lines) + God Component (114 lines)
- `magento-configurable-product` - Complex Hook (159 lines) + Multiple components
- `magento-product` - Code duplication + God Component
- `magento-catalog-search` - Hook pattern duplication

---

## CRITICAL: TASK 1 - Refactor useProductListing.ts

**File:** `app/modules/renia/magento-catalog/hooks/useProductListing.ts` (243 lines)
**Severity:** CRITICAL (blocks multiple modules)
**Estimated Time:** 12-16 hours
**Priority:** 1 (do first)

### Problem Analysis

The hook violates **SRP severely** - 5+ responsibilities:
1. State management (8 useState calls)
2. Listing state derivation logic
3. Sort value encoding/decoding (`makeSortValue`)
4. Pagination calculations
5. GraphQL request execution + error handling
6. Sort options building
7. Complex useEffect orchestration

**Current state:**
```typescript
// Currently 243 lines with:
- const [products, setProducts] = useState<...>([]);
- const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
- const [status, setStatus] = useState<...>('idle');
- const [sort, setSort] = useState<...>(undefined);
- const [sortOptions, setSortOptions] = useState<...>([]);
- const [userSelectedSort, setUserSelectedSort] = useState<...>(undefined);
- const [page, setPage] = useState(1);
- const [total, setTotal] = useState(0);
// + 3 complex useEffect blocks
// + Helper functions (makeSortValue, parseSortValue, etc.)
```

### Solution: Break into 4 Focused Utilities

#### 1.1 Extract `useDerivedListingState.ts` (30-40 lines)
**Purpose:** Derive UI-relevant state from listing data

```typescript
export type DerivedListingState = {
  isEmpty: boolean;
  isLoading: boolean;
  isReady: boolean;
  hasError: boolean;
  displayedTotal: number;
  displayedProducts: ProductInterface[];
};

export const useDerivedListingState = (
  products: ProductInterface[],
  total: number,
  status: ListingStatus,
  hasLoadedOnce: boolean
): DerivedListingState => {
  return useMemo(() => ({
    isEmpty: hasLoadedOnce && products.length === 0,
    isLoading: status === 'loading',
    isReady: status === 'ready',
    hasError: status === 'error',
    displayedTotal: total,
    displayedProducts: products,
  }), [products, total, status, hasLoadedOnce]);
};
```

**Responsibility:** ONLY derives display state from source data
**Implements:** SRP, Composition

---

#### 1.2 Extract `useSortOptions.ts` (50-60 lines)
**Purpose:** Manage sort encoding/decoding logic

```typescript
export type SortOptionValue = {
  field: string;
  order: 'ASC' | 'DESC';
};

export const makeSortValue = (option: SortOptionValue): string => {
  return `${option.field}:${option.order}`;
};

export const parseSortValue = (value: string): SortOptionValue => {
  const [field, order] = value.split(':');
  return { field, order: (order as 'ASC' | 'DESC') || 'ASC' };
};

export const useSortOptions = (
  availableOptions: SortOption[]
): {
  userSelectedSort: string | undefined;
  setUserSelectedSort: (value: string | undefined) => void;
  decodedSort: SortOptionValue | undefined;
} => {
  const [userSelectedSort, setUserSelectedSort] = useState<string | undefined>();

  const decodedSort = useMemo(() => {
    return userSelectedSort ? parseSortValue(userSelectedSort) : undefined;
  }, [userSelectedSort]);

  return { userSelectedSort, setUserSelectedSort, decodedSort };
};
```

**Responsibility:** ONLY encodes/decodes sort values
**Implements:** SRP, Testability (no side effects)

---

#### 1.3 Extract `usePagination.ts` (40-50 lines)
**Purpose:** Manage pagination state and calculations

```typescript
export const usePagination = (pageSize: number = 24) => {
  const [page, setPage] = useState(1);

  const pagination = useMemo(() => ({
    page,
    pageSize,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    setPage,
  }), [page, pageSize]);

  return pagination;
};
```

**Responsibility:** ONLY pagination logic
**Implements:** SRP, Reusability (can be used elsewhere)

---

#### 1.4 Extract `useProductRepository.ts` (60-80 lines)
**Purpose:** Handle GraphQL execution and error handling

```typescript
export type ProductListingQuery = {
  filters?: Record<string, any>;
  sort?: SortOptionValue;
  page: number;
  pageSize: number;
};

export type ProductListingResult = {
  products: ProductInterface[];
  total: number;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error?: Error;
};

export const useProductRepository = () => {
  const [state, setState] = useState<ProductListingResult>({
    products: [],
    total: 0,
    status: 'idle',
  });

  const fetchProducts = useCallback(
    async (query: ProductListingQuery) => {
      setState(prev => ({ ...prev, status: 'loading' }));
      try {
        const result = await executeGraphQLRequest(...);
        setState({
          products: result.products,
          total: result.total,
          status: 'ready',
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error as Error,
        }));
      }
    },
    []
  );

  return { ...state, fetchProducts };
};
```

**Responsibility:** ONLY GraphQL communication and error handling
**Implements:** SRP, DIP (can inject GraphQL client), Testability

---

#### 1.5 Refactored `useProductListing.ts` (50-70 lines) - Orchestrator
**Purpose:** Compose all utilities into high-level listing API

```typescript
export const useProductListing = (
  criteria: ProductListingCriteria
): ProductListingState => {
  const repository = useProductRepository();
  const pagination = usePagination();
  const sortOptions = useSortOptions(criteria.availableSortOptions);
  const derived = useDerivedListingState(
    repository.products,
    repository.total,
    repository.status,
    hasLoadedOnce
  );

  // Single useEffect: orchestrate fetching
  useEffect(() => {
    const query: ProductListingQuery = {
      filters: criteria.filters,
      sort: sortOptions.decodedSort,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    repository.fetchProducts(query);
  }, [criteria.filters, sortOptions.decodedSort, pagination.page]);

  return {
    ...derived,
    pagination,
    sort: sortOptions,
  };
};
```

**Responsibility:** ONLY orchestration (composition of other utilities)
**Implements:** SRP, OCP (extensible by adding more utilities)

### Benefits
- **Testability**: Each utility can be tested in isolation
- **Reusability**: `usePagination`, `useSortOptions`, `useProductRepository` can be used elsewhere
- **Maintainability**: Each file has single, clear responsibility
- **Performance**: Memoization preserved and optimized per utility
- **Backward Compatibility**: Public API (useProductListing) unchanged

### Implementation Steps
1. Create new files (1.1-1.4)
2. Migrate logic from useProductListing.ts to each utility
3. Update useProductListing.ts to use new utilities
4. Test each utility independently
5. Update components using useProductListing (no changes needed - API same)
6. Commit in 5 small commits

### Files Created/Modified
- [x] Create `hooks/useDerivedListingState.ts`
- [x] Create `hooks/useSortOptions.ts`
- [x] Create `hooks/usePagination.ts`
- [x] Create `hooks/useProductRepository.ts`
- [x] Modify `hooks/useProductListing.ts` (243 → 60 lines)

### Commits Required
1. Extract `useDerivedListingState` + `useSortOptions`
2. Extract `usePagination` + `useProductRepository`
3. Refactor `useProductListing` to orchestrator
4. Update types and exports
5. Documentation

---

## HIGH: TASK 2 - Refactor useConfigurableSelection.ts

**File:** `app/modules/renia/magento-configurable-product/hooks/useConfigurableSelection.ts` (159 lines)
**Severity:** HIGH (testability blocker)
**Estimated Time:** 8-10 hours
**Priority:** 2 (after TASK 1)

### Problem Analysis

Hook violates SRP - 4 responsibilities:
1. Data normalization (camelCase ↔ snake_case)
2. Variant matching algorithm (3 nested loops)
3. Available options filtering logic
4. Selection state management

**Current issues:**
- 4 separate `useMemo` blocks with deep logic
- Logger calls embedded in business logic (makes testing hard)
- Multiple conditional state derivations
- Complex normalization helper functions

### Solution: Extract 3 Service Classes

#### 2.1 `ConfigurableNormalizer.ts` (40 lines)
Data normalization service (no hooks, pure functions)

#### 2.2 `VariantMatcher.ts` (50 lines)
Variant matching algorithm (no hooks, pure functions)

#### 2.3 `AvailableOptionsCalculator.ts` (35 lines)
Available options derivation (no hooks, pure functions)

#### 2.4 Refactored `useConfigurableSelection.ts` (60 lines)
Orchestrator hook using services above

### Benefits
- **Testability**: Services are pure functions, easy to test
- **Reusability**: Services can be used in other contexts
- **Performance**: Memoization remains, but cleaner
- **Debuggability**: Logger calls isolated to service layer

### Implementation Steps
1. Create 3 service files
2. Migrate logic from hook to services
3. Update hook to use services
4. Test each service independently
5. Update components using hook (no changes needed)
6. Commit in 4 commits

---

## HIGH: TASK 3 - Refactor storefrontConfig.ts

**File:** `app/modules/renia/magento-catalog/services/storefrontConfig.ts` (121 lines)
**Severity:** HIGH (cross-cutting concerns)
**Estimated Time:** 5-6 hours
**Priority:** 3 (after TASK 1-2)

### Problem Analysis

File mixes 3 concerns:
1. **Caching strategy** - Global cache variable
2. **Config fetching** - GraphQL request execution
3. **Config parsing** - Multiple parsing functions (parseNumber, parseValues, normalizeValues)

**Current issues:**
- Global state outside React (cache not reactive)
- 3 different parsing concerns mixed together
- Multiple package imports (executeGraphQLRequest, QueryBuilder, MagentoGraphQLRequestFactory)
- No separation between what to fetch vs how to parse

### Solution: Split into 3 Services

#### 3.1 `StorefrontConfigCache.ts` (30 lines)
In-memory caching service

#### 3.2 `StorefrontConfigRepository.ts` (40 lines)
GraphQL fetching service

#### 3.3 `StorefrontConfigParser.ts` (35 lines)
Configuration parsing service

#### 3.4 `useStorefrontConfig.ts` (30 lines)
Orchestrator hook using 3 services

### Benefits
- **Separation of Concerns**: Each service has single responsibility
- **Testability**: Services are injectable and mockable
- **Reactivity**: Cache can be wrapped in React state
- **Extensibility**: Easy to add new config sources or parsers

### Implementation Steps
1. Create 3 service files
2. Extract code from storefrontConfig.ts
3. Create useStorefrontConfig hook
4. Update components using old functions
5. Commit in 4 commits

---

## MEDIUM: TASK 4 - Split ProductListingToolbar.tsx

**File:** `app/modules/renia/magento-catalog/components/ProductListingToolbar.tsx` (114 lines)
**Severity:** MEDIUM (God Component)
**Estimated Time:** 6-7 hours
**Priority:** 4

### Problem: Mixing Multiple Concerns

Component handles:
1. **Sort selector** (dropdown + onChange)
2. **Items-per-page selector** (dropdown + onChange)
3. **Pagination info** (start/end calculation)
4. **Complex styling** (80+ style properties)

**Current issues:**
- 9 props (sign of multiple responsibilities)
- Inline styles spread across multiple elements
- Result calculation logic mixed with JSX

### Solution: Extract Components

#### 4.1 `SortSelector.tsx` (35 lines)
Pure presentation component for sort dropdown

#### 4.2 `PageSizeSelector.tsx` (35 lines)
Pure presentation component for page size dropdown

#### 4.3 Refactored `ProductListingToolbar.tsx` (40 lines)
Orchestrator component using above 2 components

#### 4.4 `toolbarStyles.ts` (30 lines)
Extract inline styles to separate file for clarity

### Benefits
- **Composition**: Each component has single concern
- **Reusability**: Selectors can be used elsewhere
- **Testability**: Pure components are easier to test
- **Maintainability**: Styles in separate file for clarity

---

## MEDIUM: TASK 5 - Consolidate Product Mappers

**Files:**
- `app/modules/renia/magento-product/mappers/simpleProductMapper.ts` (111 lines)
- `app/modules/renia/magento-configurable-product/mappers/configurableMapper.ts` (111 lines)

**Severity:** MEDIUM (DRY violation)
**Estimated Time:** 4-5 hours
**Priority:** 5

### Problem: Code Duplication

Both mappers share similar concerns:
- Media mapping (90% identical)
- Price mapping (70% identical)
- Attribute mapping (50% identical)

Each file duplicates ~40 lines of mapping logic.

### Solution: Extract Shared Utilities

#### 5.1 `mappers/shared/mediaMapper.ts` (30 lines)
Reusable media mapping logic

#### 5.2 `mappers/shared/priceMapper.ts` (25 lines)
Reusable price mapping logic

#### 5.3 `mappers/shared/attributeMapper.ts` (20 lines)
Reusable attribute mapping logic

#### 5.4 Update `simpleProductMapper.ts`
Import shared utilities, reduce to 60 lines

#### 5.5 Update `configurableMapper.ts`
Import shared utilities, reduce to 70 lines

### Benefits
- **DRY Principle**: Eliminate 40+ lines of duplication
- **Maintainability**: Fix bug in one place (media mapper) fixes both
- **Consistency**: Both mappers use same mapping logic
- **Testability**: Shared utilities tested separately

---

## MEDIUM: TASK 6 - Extract Shared Listing Components

**Files affected:**
- `app/modules/renia/magento-catalog/components/CategoryProductList.tsx` (71 lines)
- `app/modules/renia/magento-catalog-search/components/SearchProductList.tsx` (94 lines)

**Severity:** MEDIUM (DRY violation)
**Estimated Time:** 3-4 hours
**Priority:** 6

### Problem: Duplicate Listing Orchestration

Both components:
1. Call listing hook (useProductListing or useSearchProductList)
2. Extract state and derivations
3. Render same toolbar + products + pagination
4. Handle loading/error/empty states identically

**Code duplication:** ~40 lines per component

### Solution: Extract Shared Component

#### 6.1 `ListingPageShell.tsx` (50 lines)
Generic listing orchestrator component

```typescript
export type ListingPageShellProps = {
  useListingHook: () => ListingState;
  title: string;
  emptyMessage?: string;
};

export const ListingPageShell: React.FC<ListingPageShellProps> = ({
  useListingHook,
  title,
  emptyMessage,
}) => {
  const listing = useListingHook();

  return (
    <div className="listing-page">
      <ProductListingToolbar {...listing} />
      {listing.isEmpty && <EmptyState message={emptyMessage} />}
      {listing.isLoading && <LoadingSpinner />}
      {listing.hasError && <ErrorMessage />}
      {listing.isReady && <ProductGrid products={listing.products} />}
      <Pagination {...listing.pagination} />
    </div>
  );
};
```

#### 6.2 Update `CategoryProductList.tsx` (30 lines)
Thin wrapper using ListingPageShell

#### 6.3 Update `SearchProductList.tsx` (35 lines)
Thin wrapper using ListingPageShell

### Benefits
- **DRY**: Eliminate 40+ lines duplication
- **Consistency**: Both pages render identically
- **Maintainability**: Fix UI logic in one place
- **Extensibility**: Easy to add new listing pages (filtering, etc.)

---

## LOB: TASK 7 - Unify Hook Patterns (Optional)

**Files affected:**
- `useCategoryProductList.ts` (48 lines)
- `useSearchProductList.ts` (48 lines)

**Severity:** LOW-MEDIUM
**Estimated Time:** 2-3 hours
**Priority:** 7 (optional, nice-to-have)

### Problem: Duplicate Hook Pattern

Both hooks:
1. Build filter criteria
2. Call `useProductListing` with criteria
3. Return result

Only difference: how they build filters (category_uid vs search text)

### Solution: Extract Factory

#### 7.1 `useCriteriaBasedProductList.ts` (40 lines)
Generic factory hook

```typescript
export const useCriteriaBasedProductList = (
  buildCriteria: () => ProductListingCriteria
): ProductListingState => {
  const criteria = useMemo(() => buildCriteria(), [...dependencies]);
  return useProductListing(criteria);
};
```

#### 7.2 Update `useCategoryProductList.ts` (15 lines)
Use factory hook

#### 7.3 Update `useSearchProductList.ts` (15 lines)
Use factory hook

### Benefits
- **DRY**: Eliminate 30 lines duplication
- **Clarity**: Pattern becomes obvious
- **Reusability**: Easy to add new listing types (filters, featured, etc.)

---

## Summary: PHASE 2 Roadmap

| Task | Module | File | Lines | Effort | Priority | ROI |
|------|--------|------|-------|--------|----------|-----|
| **1** | magento-catalog | useProductListing.ts | 243→60 | 12-16h | P1 ⭐⭐⭐ | CRITICAL |
| **2** | magento-configurable-product | useConfigurableSelection.ts | 159→60 | 8-10h | P2 ⭐⭐⭐ | VERY HIGH |
| **3** | magento-catalog | storefrontConfig.ts | 121→40 | 5-6h | P3 ⭐⭐ | HIGH |
| **4** | magento-catalog | ProductListingToolbar.tsx | 114→40 | 6-7h | P4 ⭐⭐ | MEDIUM |
| **5** | magento-product + configurable-product | mappers | 222→130 | 4-5h | P5 ⭐ | MEDIUM |
| **6** | magento-catalog + search | listing components | 165→65 | 3-4h | P6 ⭐ | LOW-MED |
| **7** | magento-catalog + search | hook patterns | 96→30 | 2-3h | P7 | LOW |

**Total Estimated Time:** 40-51 hours (Phase 2)
**Build Verification:** Required after each TASK
**Test Coverage:** Each utility tested separately + integration tests

---

## Success Criteria for Phase 2

### Code Quality
- [ ] Eliminate 16+ SOLID violations
- [ ] Reduce duplication: 8-10% → 2-3%
- [ ] No files exceeding 100 lines (except mappers)
- [ ] Average responsibilities per component: 2 → 1

### SOLID Principles
- [ ] SRP: 100% (each unit has 1 responsibility)
- [ ] OCP: Composable utilities (extensible without modification)
- [ ] LSP: Consistent interfaces
- [ ] ISP: Minimal props/parameters
- [ ] DIP: Dependency injection where applicable

### Testing
- [ ] Unit tests for all new services/utilities
- [ ] Integration tests for hooks
- [ ] No regression in existing components
- [ ] Manual testing of all affected pages

### Performance
- [ ] Build time: ±5% variance
- [ ] Runtime performance: unchanged
- [ ] Bundle size: ±2% variance

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| useProductListing refactor breaks components | Medium | HIGH | Extensive testing, commit in small steps |
| Performance regression in listing pages | Low | MEDIUM | Profile before/after, memoization checks |
| Test coverage gaps | Medium | MEDIUM | Unit tests for each new utility |
| Merge conflicts with other branches | Low | LOW | Keep commits small, clear commit messages |

---

## Timeline Estimate

| Week | Days | Tasks | Hours | Status |
|------|------|-------|-------|--------|
| Week 1 | 3 | TASK 1: useProductListing | 16h | PLANNED |
| Week 1 | 2 | TASK 2: useConfigurableSelection | 10h | PLANNED |
| Week 2 | 1 | TASK 3: storefrontConfig | 6h | PLANNED |
| Week 2 | 2 | TASK 4: ProductListingToolbar | 7h | PLANNED |
| Week 2 | 1 | TASK 5: Product Mappers | 5h | PLANNED |
| Week 3 | 0.5 | TASK 6: Shared Components | 4h | PLANNED |
| Week 3 | 0.5 | TASK 7: Hook Patterns | 3h | PLANNED |
| Buffer | 1 | Testing + Fixes | 5h | PLANNED |
| **TOTAL** | **~10 days** | **7 tasks** | **56h** | **PLANNED** |

---

## Next Steps

1. ✅ Analysis Complete (Phase 1 insights applied)
2. 📋 Planning Complete (this document)
3. 🎯 Ready to Start TASK 1: useProductListing.ts refactoring
4. 📝 Full implementation with small commits
5. ✅ Verification and testing
6. 📚 Documentation updates

**Ready to begin TASK 1?** Say "start TASK 1" or choose a different task.

---

## References

- **Phase 1 Results**: See `/PHASE1_SOLID_REFACTORING.md`
- **Architecture docs**: See `/REFACTORING_STRATEGY.md`
- **SOLID Analysis**: Initial exploration reports
- **Component Analysis**: Line counts and violation details above
