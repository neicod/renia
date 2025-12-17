# PHASE 1: SOLID Refactoring - Execution Plan

**Status:** IN PROGRESS
**Start Date:** 2025-12-16
**Target Completion:** 2025-12-19 (3-4 days)
**Total Effort:** 18.5 hours

---

## Overview

This document tracks the implementation of Phase 1 SOLID refactoring across two modules:
1. **magento-cart**: Extract useAddToCart hook + Dependency Injection
2. **magento-category**: Split CategoryMainMenu into smaller components/services

---

## TASK 1: Cart Module - Extract useAddToCart Hook ✅ COMPLETED (2.5h)

**Estimated Time:** 4-5h
**Status:** COMPLETED - 2 commits done

### Files to Create
- [x] `app/modules/renia/magento-cart/hooks/useAddToCart.ts`
- [x] `app/modules/renia/magento-cart/docs/useAddToCart.md`
- [ ] `tests/useAddToCart.test.ts`
- [ ] `tests/addToCartComponents.test.ts`

### Files to Modify
- [x] `app/modules/renia/magento-cart/components/AddToCartButton.tsx`
- [x] `app/modules/renia/magento-cart/components/ProductAddToCartPanel.tsx`
- [x] `app/modules/renia/magento-cart/components/SimpleAddToCartIcon.tsx`

### Commits Required
1. [x] Hook foundation + docs
2. [x] Component refactoring (all 3 components)
3. [ ] Tests

### Manual Testing
- [ ] Build success: `npm run build:client && npm run build:server`
- [ ] Dev environment: `npm run dev:server` + `npm run dev:client`
- [ ] AddToCartButton renders correctly
- [ ] Click "add" button adds product to cart
- [ ] Success toast displays
- [ ] Error toast displays on API error
- [ ] ProductAddToCartPanel form submit works
- [ ] SimpleAddToCartIcon click works
- [ ] Disabled state during adding works

---

## TASK 2: Category Module - Split CategoryMainMenu ⏳ PENDING

**Estimated Time:** 5-6h
**Status:** Pending (starts after Task 1)

### Files to Create
- [ ] `app/modules/renia/magento-category/services/configService.ts`
- [ ] `app/modules/renia/magento-category/services/menuCacheStrategy.ts`
- [ ] `app/modules/renia/magento-category/hooks/useMenuData.ts`
- [ ] `app/modules/renia/magento-category/components/MenuTree.tsx`
- [ ] `app/modules/renia/magento-category/components/MenuStateMessage.tsx`
- [ ] `app/modules/renia/magento-category/docs/architecture.md`
- [ ] `tests/categoryMenu.test.ts`

### Files to Modify
- [ ] `app/modules/renia/magento-category/components/CategoryMainMenu.tsx`

### Commits Required
1. [ ] Services layer (ConfigService + MenuCacheStrategy)
2. [ ] Hook layer (useMenuData)
3. [ ] Presentation components (MenuTree + MenuStateMessage)
4. [ ] Refactor CategoryMainMenu
5. [ ] Tests

### Manual Testing
- [ ] Build success
- [ ] CategoryMainMenu renders correctly
- [ ] Menu HTML structure unchanged
- [ ] CSS classes identical
- [ ] Preloaded menu works (SSR)
- [ ] Lazy fetch works (browser)
- [ ] Error/empty/loading states display

---

## TASK 3: Cart Module - Dependency Injection ⏳ PENDING (OPTIONAL)

**Estimated Time:** 3-4h
**Status:** Optional - can skip for Phase 1

### Files to Create
- [ ] `app/modules/renia/magento-cart/interfaces/services.ts`
- [ ] `app/modules/renia/magento-cart/adapters/toastAdapter.ts`
- [ ] `app/modules/renia/magento-cart/adapters/i18nAdapter.ts`
- [ ] `app/modules/renia/magento-cart/adapters/cartManagerAdapter.ts`
- [ ] `app/modules/renia/magento-cart/docs/dependency-injection.md`
- [ ] `tests/useAddToCartDIP.test.ts`

### Files to Modify
- [ ] `app/modules/renia/magento-cart/hooks/useAddToCart.ts`

### Commits Required
1. [ ] Interfaces
2. [ ] Adapters
3. [ ] Refactor useAddToCart + tests

---

## Success Criteria

### Code Quality ✅
- [ ] Duplicated code reduced by 90+ lines (Task 1)
- [ ] CategoryMainMenu: 139 → ~35 lines (Task 2)
- [ ] Max 2 responsibilities per component

### SOLID Principles ✅
- [ ] SRP: Each component has 1 responsibility
- [ ] OCP: MenuTree/MenuStateMessage extensible
- [ ] ISP: Minimal interfaces (Task 3)
- [ ] DIP: Injected dependencies (Task 3)

### Testing ✅
- [ ] Unit tests: Min. 10 tests
- [ ] Integration tests: Min. 3 tests
- [ ] Manual tests: 100% of checklist

### Business ✅
- [ ] Zero regressions
- [ ] 100% backward compatibility
- [ ] Build time: ±5% variance

---

## Risks & Mitigation

### Task 1 Risks
| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Hook callbacks fail | Low | Unit tests |
| Toast behavior changes | Low | Copy logic exactly |
| UI regression | Medium | Manual testing checklist |

### Task 2 Risks
| Risk | Probability | Mitigation |
|------|-------------|-----------|
| HTML structure changes | Low | Copy renderTree 1:1 |
| ConfigService SSR fails | Low | Test globalThis + window |
| Race conditions in useMenuData | Medium | fetchingRef + cancelled flag |
| CSS classes break | Low | Copy class names 1:1 |

---

## Rollback Plan

### If Task 1 fails:
```bash
git revert <commit-3>  # Tests
git revert <commit-2>  # Components
git revert <commit-1>  # Hook
npm run build
```

### If Task 2 fails:
```bash
git revert <commit-5>  # Tests
git revert <commit-4>  # Refactor CategoryMainMenu
git revert <commit-3>  # Components
git revert <commit-2>  # Hook
git revert <commit-1>  # Services
npm run build
```

---

## Timeline

| Task | Duration | Day |
|------|----------|-----|
| Task 1: useAddToCart (hook + components + tests) | 6h | Day 1 |
| Task 2: CategoryMainMenu split (services + hook + components + tests) | 7h | Day 2 |
| Task 3: DIP refactor (optional) | 3.5h | Day 3 |
| Buffer | 2h | Day 3-4 |
| **TOTAL** | **18.5h** | **3-4 days** |

---

## References

- Main strategy: `/Users/dcienkuszewski/www/renia2/frontend/REFACTORING_STRATEGY.md`
- Detailed plan: `/Users/dcienkuszewski/.claude/plans/cheerful-cooking-rossum.md`
- CLAUDE.md: Project guidelines
- AGENT_INSTRUCTIONS.md: Development standards
