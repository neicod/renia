# TIER 1: Integracja Magento GraphQL Client - DOKUMENTACJA

## ✅ Co Zostało Zrobione

Kompletna integracja `renia-magento-graphql-client` z refaktoryzowanym `renia-graphql-client` (SOLID compliance).

### Nowe Komponenty

#### 1. **MagentoHttpClient** (`transport/MagentoHttpClient.ts`)
```typescript
class MagentoHttpClient implements HttpClient {
  constructor(hostHeader?: string)
  async execute(url: string, options: RequestInit): Promise<HttpResponse>
}
```

**Odpowiedzialność:** HTTP transport dla Magento GraphQL requestów
- Wraps FetchHttpClient
- Aplikuje MAGENTO_HOST_HEADER jeśli jest skonfigurowany
- Magento-specific error handling (future extension)

**Użycie:**
```typescript
const httpClient = new MagentoHttpClient(process.env.MAGENTO_HOST_HEADER);
const executor = new GraphQLRequestExecutor({ httpClient });
```

---

#### 2. **MagentoAuthStrategy** (`auth/MagentoAuthStrategy.ts`)
```typescript
class MagentoAuthStrategy implements AuthStrategy {
  readonly type = 'magento';
  constructor(customerToken: string)
  apply(headers: Record<string, string>): void
}

class MagentoAdminAuthStrategy implements AuthStrategy {
  readonly type = 'magento-admin';
  constructor(adminToken: string)
  apply(headers: Record<string, string>): void
}
```

**Odpowiedzialność:** Autoryzacja dla Magento customer/admin tokenów
- Implementuje AuthStrategy interface
- Enkapsuluje Magento token format
- Rozszerzalne dla innych auth typów

**Użycie:**
```typescript
const auth = [new MagentoAuthStrategy(customerToken)];
const request = MagentoGraphQLRequestFactory.create({
  payload,
  auth
});
```

---

#### 3. **MagentoGraphQLLogger** (`logging/MagentoGraphQLLogger.ts`)
```typescript
class MagentoGraphQLLogger implements GraphQLLogger {
  logRequest(operationId, method, payload, variables): void
  logResponse(status, operationId, duration, errorCount): void
  logError(operationId, method, endpoint, duration, error): void
}
```

**Odpowiedzialność:** Magento-specific logging
- Implementuje GraphQLLogger interface
- Dodaje `isMagentoOperation` context do logów
- Respektuje GRAPHQL_LOG_REQUEST i GRAPHQL_LOG_RESPONSE env vars

**Użycie:**
```typescript
const logger = new MagentoGraphQLLogger();
const executor = new GraphQLRequestExecutor({ logger });
```

---

#### 4. **Services Layer** (`services/index.ts`)
```typescript
export const getMagentoHttpClient(): HttpClient
export const getMagentoGraphQLLogger(): GraphQLLogger
export const resetMagentoClients(): void
```

**Odpowiedzialność:** Singleton factories dla Magento clients
- Caches instances dla consistent behavior
- Automatycznie aplikuje MAGENTO_HOST_HEADER z env
- resetMagentoClients() dla testowania

**Użycie:**
```typescript
const httpClient = getMagentoHttpClient();  // cached singleton
const logger = getMagentoGraphQLLogger();     // cached singleton
```

---

### Refaktoryzacja requestFactory.ts

**Stare API (Backward Compatible):**
```typescript
const request = MagentoGraphQLRequestFactory.create({
  payload: queryBuilder,
  variables: { id: '123' }
});

const response = await executeRequest(request);
```

**Nowe API (SOLID-based):**
```typescript
const executor = MagentoGraphQLRequestFactory.createExecutor();
const request = MagentoGraphQLRequestFactory.create({
  payload: queryBuilder,
  variables: { id: '123' }
});

const response = await executor.execute(request);
```

**Zalety nowego API:**
- ✅ Dependency injection - łatwe testowanie
- ✅ Magento-specific clients zintegrowane
- ✅ Consistent logging i error handling
- ✅ Rozszerzalne dla custom implementations

---

## 🔄 Migration Guide

### Dla Istniejącego Kodu

**Brak zmian wymaganych** - stare API nadal działa:

```typescript
// Przed (nadal działa)
const request = MagentoGraphQLRequestFactory.create({ payload });
const response = await executeRequest(request);

// Po (opcjonalnie - nowe API)
const executor = MagentoGraphQLRequestFactory.createExecutor();
const response = await executor.execute(request);
```

### Dla Nowego Kodu

Preferuj nowe API dla lepszego testowania:

```typescript
import {
  MagentoGraphQLRequestFactory,
  getMagentoHttpClient,
  getMagentoGraphQLLogger,
  MagentoAuthStrategy
} from 'renia-magento-graphql-client';

// Tworzenie executora (once per app)
const executor = MagentoGraphQLRequestFactory.createExecutor();

// Użycie
const request = MagentoGraphQLRequestFactory.create({
  payload: queryBuilder,
  variables: { customerId: '123' },
  auth: [new MagentoAuthStrategy(customerToken)]
});

const response = await executor.execute(request);
```

---

## 🧪 Testowanie

### Unit Tests (TIER 2)

```typescript
describe('MagentoHttpClient', () => {
  it('should apply MAGENTO_HOST_HEADER', async () => {
    const client = new MagentoHttpClient('magento.example.com');
    const response = await client.execute(url, options);
    expect(options.headers['host']).toBe('magento.example.com');
  });
});

describe('MagentoAuthStrategy', () => {
  it('should apply customer token', () => {
    const strategy = new MagentoAuthStrategy('token123');
    const headers = {};
    strategy.apply(headers);
    expect(headers['authorization']).toBe('Bearer token123');
  });
});

describe('MagentoGraphQLLogger', () => {
  it('should log requests with isMagentoOperation context', () => {
    const logger = new MagentoGraphQLLogger();
    logger.logRequest('getProduct', 'POST', payload, variables);
    // verify logged with { isMagentoOperation: true }
  });
});
```

### Integration Tests (TIER 2)

```typescript
describe('MagentoGraphQLRequestFactory', () => {
  it('should create executor with Magento clients', () => {
    const executor = MagentoGraphQLRequestFactory.createExecutor();
    expect(executor).toBeInstanceOf(GraphQLRequestExecutor);
  });

  it('should execute request with Magento HTTP client', async () => {
    const executor = MagentoGraphQLRequestFactory.createExecutor();
    const request = MagentoGraphQLRequestFactory.create({
      payload: 'query { products { id } }'
    });
    const response = await executor.execute(request);
    expect(response.status).toBe(200);
  });
});
```

---

## 🎯 Next Steps (TIER 2)

1. **Unit Tests** (6-8 godzin)
   - MagentoHttpClient tests
   - MagentoAuthStrategy tests
   - MagentoGraphQLLogger tests
   - Services singleton tests

2. **Integration Tests** (4-5 godzin)
   - Full request lifecycle
   - HTTP mocking
   - Logger integration
   - Error scenarios

3. **Documentation** (1-2 godziny)
   - Migration guide dla zespołu
   - Examples dla custom HttpClient/Logger
   - Benchmarks before/after

---

## 📊 Podsumowanie TIER 1

| Komponenta | Odpowiedzialność | SOLID | Status |
|-----------|------------------|-------|--------|
| MagentoHttpClient | HTTP transport | DIP + SRP | ✅ |
| MagentoAuthStrategy | Magento auth | OCP + SRP | ✅ |
| MagentoGraphQLLogger | Magento logging | DIP + SRP | ✅ |
| Services layer | Singleton factories | DIP | ✅ |
| requestFactory | Executor creation | Facade | ✅ |

**Backward Compatibility:** ✅ 100% maintained
**Build Status:** ✅ Passing
**Test Coverage:** ⏳ Coming in TIER 2

---

## 📝 Konfiguracja

### Environment Variables

```bash
# Optional: Magento Host Header (dla multi-host setup)
export MAGENTO_HOST_HEADER=magento.example.com

# Existing (already supported)
export MAGENTO_GRAPHQL_ENDPOINT=https://magento.example.com/graphql
export MAGENTO_PROXY_ENDPOINT=/api/magento/graphql
export MAGENTO_STORE_CODE=default
export MAGENTO_ROOT_CATEGORY_ID=2

# Logging
export GRAPHQL_LOG_REQUEST=1
export GRAPHQL_LOG_RESPONSE=1
```

---

**Status:** ✅ TIER 1 Complete
**Commit:** 21adc4a
**Build:** ✅ Passing
**Backward Compatibility:** ✅ Maintained
