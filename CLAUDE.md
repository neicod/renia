# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language

Respond in Polish. Keep technical terms (component names, file paths, commands) in English.

## Project Overview

Renia is a React SSR storefront application for Magento. The main codebase is in `frontend/`.

## Common Commands

```bash
# Development (run both in parallel)
cd frontend
npm run dev:server     # SSR server on port 3000 (tsx watch)
npm run dev:client     # Client bundle watcher (esbuild -> dist/public)

# Production build
npm run build          # Runs build:i18n, build:client, build:server
npm start              # NODE_PATH=./modules node dist/server/index.js

# Testing
npm test               # Uses tsx --test (tests in tests/*.test.ts)

# Linting
npm run lint           # ESLint for .ts/.tsx/.js/.jsx

# i18n (after changing translation keys)
npm run build:i18n     # Merges app/modules/*/i18n with app/i18n -> dist/i18n
```

Docker commands (from repo root):
```bash
make docker-setup      # npm install + build:client in container
make docker-up         # Build and start web service (port 3002->3000)
make docker-shell      # Interactive shell in container
```

## Architecture

### SSR + Hydration Flow
1. Server (`src/server/index.tsx`) renders `AppRoot`, injects into HTML template
2. Client (`src/client/index.tsx`) hydrates via `BrowserRouter`
3. Static assets served from `dist/public` at `/static`

### Module System
- Modules in `frontend/app/modules/<vendor>/<module>/` (preferred) or `frontend/modules/`
- Enabled/disabled in `app/etc/config.json` (`modules.<name> = 1/0`)
- Modules resolved via `NODE_PATH=./modules` and npm file dependencies
- Each module can provide: `routes.ts`, `interceptors/`, `registerComponents.ts`

### Framework Structure (`src/framework/`)
- `api/` - GraphQL client with augmenters (`registerGraphQLHeaderAugmenter`, `registerGraphQLQueryAugmenter`)
- `registry/` - Module and component registries
- `router/` - Route resolution from module `routes.ts` files
- `storage/` - Browser storage abstraction (never use `localStorage` directly)
- `runtime/` - `AppEnvironment` context (runtime mode, storeCode, storeConfig)

### Layout & Slots
- Layout system: `src/framework/layout/` contains core components (`LayoutShell`, `SlotRenderer`) and templates (`Layout1Column`, `Layout2ColumnsLeft`, `LayoutEmpty`)
- Slots available: `header`, `control-menu`, `content`, `left`, `footer`, `global-overlay`
- Modules inject components via interceptors
- Slot entries sorted by `priority` (higher = rendered first)
- Product-specific slots: `product-listing-actions`, `product-view-actions`

### Product Strategy Pattern
Products use strategy pattern for context-aware "Add to Cart" UI:
- **Listing** (`add-to-cart-product-listing`): Minimal UI
  - Simple: Icon 🛒 only (qty=1)
  - Configurable: Options selector + Icon 🛒 (qty=1)
- **Product Page** (`add-to-cart-product-page`): Full forms
  - Simple: Icon 🛒 only (qty=1)
  - Configurable: Options selector + Icon 🛒 (qty=1)

Flow:
1. `ProductAddToCartResolver` (in `ProductTile` for listing, or `product-view-actions` slot) receives product
2. Resolver queries `productStrategies` registry by `product.__typename` and `slot`
3. Registry returns component for that type+slot combo
4. Component renders with full product object

Adding new product types:
1. Create `registerStrategies()` function in your module
2. Call `registerProductStrategy({ type: 'YourType', components: { 'add-to-cart-product-page': Panel, 'add-to-cart-product-listing': Icon } })`
3. Call `registerProductStrategy()` in both `src/server/index.tsx` and `src/client/index.tsx`

### Interceptors
- Files in `interceptors/default.ts` (global) or `interceptors/<context>.ts` (category, search, product, etc.)
- API: `api.layout.get(slotName).add(componentPath, id, { sortOrder, props, meta })`
- Hierarchical layout tree: `page.header`, `page.content`, `page.footer`, `page.global-overlay`, `page.header.control-menu`
- For product pages: Use `ProductAddToCartResolver` with `slot: 'add-to-cart-product-page'` to auto-select component by product type
- Sort order: Use `{ before: '-' }` for first position, or `{ before: 'id' }` / `{ after: 'id' }` for relative positioning

### GraphQL Layer
- `renia-graphql-client`: QueryBuilder, executeRequest
- `renia-magento-graphql-client`: Magento-specific factory with operationId
- Always use `executeGraphQLRequest` from `@framework/api/graphqlClient`
- Augmenters modify headers/queries globally (e.g., store header, authorization)

## Key Environment Variables

```
MAGENTO_GRAPHQL_ENDPOINT    # Required: Magento GraphQL URL
MAGENTO_STORE_CODE          # Optional: multi-store code
MAGENTO_ROOT_CATEGORY_ID    # Optional: root category for menu
MAGENTO_HOST_HEADER         # Optional: Host header override
GRAPHQL_LOG_REQUEST=0       # Disable request logging
GRAPHQL_LOG_RESPONSE=0      # Disable response logging
```

## File Conventions

- Mark files with `// @env: server|browser|mixed` at top
- JSX files must use `.tsx` extension
- Use bare specifiers for module imports: `import x from 'renia-magento-cart'`
- Component registration uses string paths matching `componentPath` in routes/slots

## Key Modules

| Module | Purpose |
|--------|---------|
| `renia-magento-store` | Store config, headers |
| `renia-magento-catalog` | Product listing (category pages) |
| `renia-magento-category` | Category data, menu |
| `magento-product` | Product entity, repository |
| `renia-magento-cart` | Cart logic, actions, UI |
| `renia-i18n` | Translations provider |
| `renia-layout` | Layout shell, slot system |
| `renia-interceptors` | Interceptor loader |

## Documentation References

- `frontend/README.md` - Full architecture documentation
- `frontend/docs/MODULES.md` - Module details and structure
- `frontend/AGENT_INSTRUCTIONS.md` - Detailed development rules
- `docs/concept.md` within modules - Module-specific contracts

## ⚠️ CRITICAL: Commits & Code Changes

**NEVER commit changes yourself.** Always ask the user for approval first.
- Present your changes and explain what you changed and why
- Wait for user feedback/approval
- Only commit if explicitly requested by user
- This ensures the user has control over their codebase history

**NEVER make random changes without understanding them.** This caused regressions and wasted time.

### Before Making Changes
1. **Read and understand the code** - Look at existing patterns, not just the error
2. **Check documentation first** - Read CLAUDE.md, AGENT_INSTRUCTIONS.md, and relevant module docs
3. **Ask if unsure** - Use AskUserQuestion tool when:
   - API/behavior is unclear (e.g., hierarchical vs flat layout API)
   - Change affects multiple components
   - Multiple valid approaches exist
4. **Never guess** - Never assume file structure, API names, or import paths

### Debugging Approach
1. **Add logging strategically** - Only where necessary, not everywhere
2. **Understand the flow first** - Trace data from GraphQL → hook → component → UI
3. **Check dependencies** - Verify that imports, types, and modules are correct
4. **Test incrementally** - Build and test each change separately
5. **Revert bad changes immediately** - Don't persist with wrong approach

### Changes That Need Verification
- **API calls** - Verify correct method/property names in framework (e.g., `api.layout.get()` API)
- **Interceptor changes** - Test that slot entries render correctly
- **Type changes** - Ensure backward compatibility
- **Hook logic** - Test with real data, not assumptions
