# CategoryMainMenu - SOLID Refactoring Architecture

## Overview

CategoryMainMenu refactored from 139-line God Component to a 48-line orchestrator, following SOLID principles.

**Before:** 6 responsibilities mixed in one component (139 lines)
**After:** 7 focused components/services + slim orchestrator (48 lines)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CategoryMainMenu                          │
│  (slim orchestrator - only conditional rendering)           │
│  - Calls useMenuData for data + status                       │
│  - Routes to MenuTree or MenuStateMessage                    │
└────┬────────────────────────────────────┬───────────────────┘
     │                                     │
     │ uses ConfigService                  │ uses useMenuData
     ▼                                     ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│   ConfigService          │      │   useMenuData hook       │
│  - getGraphQLEndpoint()  │      │  - State management      │
│  - getRootCategoryId()   │      │  - Fetch orchestration   │
│  - getPreloadedMenu()    │      │  - Error handling        │
└──────────────────────────┘      └────────┬─────────────────┘
                                           │
                                           │ uses
                                           ▼
                                  ┌──────────────────────────┐
                                  │   fetchMenu service      │
                                  │  (existing - unchanged)  │
                                  └──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│         Presentation Components (Pure / No Logic)             │
├──────────────────────┬──────────────────────────────────────┤
│      MenuTree        │      MenuStateMessage                │
│  - Recursive render  │  - Loading/error/empty display       │
│  - CSS classes       │  - Tones: muted/error/info           │
│  - ARIA attributes   │  - No data fetching                  │
└──────────────────────┴──────────────────────────────────────┘
```

## Components Breakdown

### 1. ConfigService (45 lines)
**File:** `services/configService.ts`
**Interface:** `IConfigService`

Responsible for:
- Reading GraphQL endpoint from globalThis or window
- Reading root category ID
- Reading preloaded menu

**SOLID Principles:**
- SRP: Only configuration reading
- DIP: Implements interface, injected into useMenuData

---

### 2. MenuCacheStrategy (40 lines)
**File:** `services/menuCacheStrategy.ts`
**Interface:** `ICacheStrategy<T>`

Responsible for:
- In-memory caching of menu data
- Future extensibility (can be replaced with LocalStorageCache, etc.)

**SOLID Principles:**
- SRP: Only cache management
- OCP: Can be extended without modification
- DIP: Implements generic interface

---

### 3. useMenuData Hook (75 lines)
**File:** `hooks/useMenuData.ts`

Responsible for:
- Dependency injection of ConfigService
- State management (idle/loading/ready/error/empty)
- Preloaded data handling
- Lazy fetching with cancellation
- Error handling

**SOLID Principles:**
- SRP: Single responsibility - data fetching orchestration
- DIP: Accepts ConfigService as dependency (testable)

**Key Details:**
```typescript
- Preloaded data takes precedence over lazy fetch
- fetchingRef prevents duplicate requests
- cancelled flag handles component unmount
- useCallback memoization for performance
```

---

### 4. MenuTree Component (40 lines)
**File:** `components/MenuTree.tsx`

Responsible for:
- Recursive rendering of menu hierarchy
- CSS class mapping per depth level
- ARIA attributes

**SOLID Principles:**
- SRP: Only tree rendering
- OCP: Extensible via depth parameter
- Pure component (no side effects)

**Features:**
```typescript
depth=0: main menu (className='main-menu')
depth>0: dropdown (className='main-menu__dropdown', role='menu')
```

---

### 5. MenuStateMessage Component (30 lines)
**File:** `components/MenuStateMessage.tsx`

Responsible for:
- Displaying status messages (loading/error/empty)
- Tone-based color coding

**SOLID Principles:**
- SRP: Only status message rendering
- OCP: Extensible via tone prop

**Tones:**
- `muted` (grey) - no endpoint
- `error` (red) - API failed
- `info` (navy) - loading

---

### 6. CategoryMainMenu - Refactored (48 lines)
**File:** `components/CategoryMainMenu.tsx`

Responsible for:
- Orchestrating data fetching
- Conditional routing to MenuTree or MenuStateMessage
- Passing i18n to status messages

**SOLID Principles:**
- SRP: Only orchestration (single responsibility)
- DIP: Injects configService and useMenuData
- Clean separation of concerns

**Conditional Rendering:**
```typescript
if (!endpoint) → no GraphQL config
if (status === 'error') → fetch failed
if (status === 'loading' && items.empty) → loading
if (status === 'empty') → no menu items
else → render MenuTree
```

---

## Backward Compatibility

✅ **No breaking changes:**
- CategoryMainMenu Props: unchanged (React.FC with no props)
- HTML output: identical (same CSS classes, ARIA attributes)
- Business logic: identical behavior
- External interface: unchanged

---

## Testing Strategy

### Unit Tests (For Each Component)

**ConfigService:**
- Test SSR (globalThis) reading
- Test browser (window) reading
- Test fallback logic

**MenuCacheStrategy:**
- Test get/set/has/clear operations

**useMenuData:**
- Test preloaded data handling
- Test lazy fetching
- Test error states
- Test cancellation

**MenuTree:**
- Test recursive rendering
- Test CSS class assignment
- Test empty handling

**MenuStateMessage:**
- Test tone colors
- Test message display

---

## Migration Notes

If you want to extend or customize:

1. **Custom Cache Strategy:**
   Replace `menuCache` with your own `ICacheStrategy<MenuItem[]>` implementation.

2. **Custom Config Source:**
   Implement `IConfigService` with your data source (API, local file, etc.)

3. **Custom Message Tones:**
   Extend `MenuStateMessage` with additional tone colors.

4. **Custom Tree Rendering:**
   Extend `MenuTree` with custom depth handling or styling.

---

## Performance

- `useCallback` memoization prevents unnecessary re-renders
- `useMemo` for endpoint/rootCategoryId prevents recalculation
- `fetchingRef` prevents duplicate requests
- `cancelled` flag prevents memory leaks on unmount
- Cache reuses menu data across page navigations

---

## Files Changed

| File | Lines | Reduction |
|------|-------|-----------|
| CategoryMainMenu.tsx | 48 → 139 | -91 lines |
| **Total Code Extraction** | 7 files | +300 lines (but -91 from component) |

Net effect: **More focused, testable, maintainable code** despite slightly more total lines (good trade-off for SOLID compliance).

---

## References

- **SOLID Principles:** See `/REFACTORING_STRATEGY.md`
- **Plan Details:** See `/PHASE1_SOLID_REFACTORING.md`
- **GraphQL Client Refactoring:** See `/app/modules/renia/graphql-client/REFACTORING_SOLID.md`
