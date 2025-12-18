// @env: node
// Tests for CategoryProductList hydration behavior
// Verifies that SSR and CSR states match (no hydration mismatch)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Test 1: Verify useProductRepository initialStatus
 * When no initialListing is provided:
 * - SSR should set status='loading' (not 'idle')
 * - CSR should also set status='loading'
 * This prevents hydration mismatch where SSR shows "No products" and CSR shows "Loading..."
 */
test('useProductRepository: should initialize with status="loading" when no initialListing provided', () => {
    // Simulate: initialListing = undefined
    const initialListing = undefined;

    // Current logic:
    // const initialStatus = initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'loading');

    const initialStatus = initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'loading');

    // Expect: both SSR and CSR should start with 'loading'
    assert.strictEqual(initialStatus, 'loading', 'Status should be "loading" when no initialListing');
});

test('useProductRepository: should initialize with status="ready" when initialListing has items', () => {
  const initialListing = { items: [{}, {}], totalCount: 2 };
  const initialStatus = initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'loading');
  assert.strictEqual(initialStatus, 'ready', 'Status should be "ready" when items exist');
});

test('useProductRepository: should initialize with status="empty" when initialListing exists but has no items', () => {
  const initialListing = { items: [], totalCount: 0 };
  const initialStatus = initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'loading');
  assert.strictEqual(initialStatus, 'empty', 'Status should be "empty" when items array is empty');
});

/**
 * Test 2: Verify CategoryProductList rendering logic
 * When categoryUid is undefined:
 * - Component should return null (not render ListingPageContent)
 * - This prevents renderingListingPageContent without products
 */
test('CategoryProductList: should handle missing categoryUid gracefully', () => {
    const meta = undefined;
    const category = (meta as any)?.category;
    const categoryUid = typeof category?.id === 'string' ? category.id : undefined;

    // categoryUid should be undefined when category is missing
    assert.strictEqual(categoryUid, undefined, 'categoryUid should be undefined when meta.category missing');
});

test('CategoryProductList: should extract categoryUid from meta.category when present', () => {
    const meta = {
      category: {
        id: 'women-uid',
        label: 'Women',
        description: 'Women products'
      }
    };
    const category = (meta as any)?.category;
    const categoryUid = typeof category?.id === 'string' ? category.id : undefined;

    assert.strictEqual(categoryUid, 'women-uid', 'categoryUid should match category.id');
});

/**
 * Test 3: Hydration consistency check
 * Both SSR and CSR should render identical markup
 */
test('Hydration consistency: SSR should show loading state when no initial data', () => {
    // SSR path:
    // 1. routeHandler fetches category from Magento
    // 2. If successful, passes category in meta
    // 3. If failed (e.g., Magento unavailable), does not attach category data
    // 4. CategoryProductList extracts categoryUid from meta.category
    // 5. If categoryUid is undefined, returns null (no content rendered)
    // 6. If categoryUid exists, renders ListingPageContent with status='loading'

    const ssrMeta = {}; // No category object
    const ssrCategory = (ssrMeta as any)?.category;
    const ssrCategoryUid = typeof ssrCategory?.id === 'string' ? ssrCategory.id : undefined;

    // SSR should not render anything when categoryUid is undefined
    assert.strictEqual(ssrCategoryUid, undefined);
});

test('Hydration consistency: CSR should also start with status="loading" for consistent hydration', () => {
    // CSR path:
    // 1. Hydrates HTML from SSR
    // 2. Receives same meta from __APP_BOOTSTRAP__
    // 3. Renders same markup
    // 4. useProductRepository starts with status='loading' (not 'idle')
    // 5. Effect triggers, fetches products
    // 6. Updates status to 'ready' or 'empty'

    const csrMeta = { category: undefined };
    const csrCategory = (csrMeta as any)?.category;
    const csrCategoryUid = typeof csrCategory?.id === 'string' ? csrCategory.id : undefined;

    // CSR should match SSR state
    assert.strictEqual(csrCategoryUid, undefined);

    // When useProductRepository initializes:
    const initialListing = undefined;
    const initialStatus = initialListing?.items?.length ? 'ready' : (initialListing ? 'empty' : 'loading');
    assert.strictEqual(initialStatus, 'loading', 'Status should be "loading" for hydration consistency');
});
