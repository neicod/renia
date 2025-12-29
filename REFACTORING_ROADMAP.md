# Roadmap Refaktoryzacji - Kolejne Kroki

## 📋 Przegląd

Po ukończeniu refaktoryzacji `renia-graphql-client` wg. SOLID, istnieje kilka logicznych ścieżek do kontynuacji.

---

## 🎯 TIER 1: Integracja (HIGH PRIORITY)

### Krok 1: Aktualizacja `renia-magento-graphql-client`
**Plik:** `app/modules/renia/magento-graphql-client/requestFactory.ts`
**Cel:** Wykorzystanie nowych abstrakcji z refaktoryzowanego graphql-client

**Co robić:**
- Wdrożenie custom `HttpClient` dla Magento (route proxy, headers)
- Wdrożenie custom `AuthStrategy` dla Magento token auth
- Wdrożenie custom `GraphQLLogger` dla Magento-specific logging
- Wstrzyknięcie zależności do GraphQLRequestExecutor

**Korzyści:**
- Magento-specific logika oddzielona od core graphql-client
- Łatwo zmienić na bezpośredni endpoint bez refaktoryzacji
- Consistent logging dla Magento operacji

**Szacunkowy czas:** 4-6 godzin

---

### Krok 2: Aktualizacja wszystkich callów `executeRequest`
**Pliki:** `app/modules/renia/framework/api/graphqlClient.ts` + wszystkie moduły
**Cel:** Optymalizacja istniejących callów, wykorzystanie nowych features

**Co robić:**
1. Przeanalizować wszystkie miejsca użycia `executeRequest`
2. Zastąpić gdzie można custom loggerem/httpClient
3. Dodać `operationId` gdzie brakuje
4. Sprawdzić `timeoutMs` values

**Szacunkowy czas:** 2-3 godziny

---

## 🎯 TIER 2: Testy (HIGH PRIORITY)

### Krok 3: Unit testy dla nowych komponentów
**Katalog:** `tests/graphql-client/`
**Cel:** 100% test coverage dla nowych abstrakcji

**Co testować:**
- RequestPayloadBuilder - różne payload types
- ResponseHandler - parsing, error validation
- TimeoutManager - abort signal, cleanup
- GraphQLRequestExecutor - composition, DI
- GraphQLRenderer - rendering logic
- AuthStrategies - każda strategia osobnie

**Szacunkowy czas:** 6-8 godzin

### Krok 4: Integration testy z HTTP mocking
**Cel:** End-to-end testing Request -> Response flow

**Co testować:**
- Full request lifecycle z custom HttpClient mock
- Logger integration
- Auth header application
- Error scenarios (401, 403, timeout)

**Szacunkowy czas:** 4-5 godzin

---

## 🎯 TIER 3: Inne Moduły (MEDIUM PRIORITY)

### Krok 5: Refaktoryzacja `renia-magento-graphql-client`
**Plik:** `app/modules/renia/magento-graphql-client/`
**Cel:** Zastosowanie SOLID do tego modułu

**Analiza potrzebna:**
- requestFactory.ts - jakie odpowiedzialności?
- utils/ - co tam jest?
- Czy są naruszenia SOLID?

**Szacunkowy czas:** TBD (zależy od analizy)

### Krok 6: Refaktoryzacja `app/modules/renia/framework/api/graphqlClient.ts`
**Cel:** Augmenters pattern -> Strategy pattern?

**Analiza potrzebna:**
- Czy augmenters należą do graphql-client czy są middleware?
- Czy getGraphQLClient() factory jest wystarczająco elastyczna?
- Jak integrujesz augmenters z GraphQLRequestExecutor?

**Szacunkowy czas:** TBD (zależy od analizy)

---

## 🎯 TIER 4: Zaawansowane Features (MEDIUM PRIORITY)

### Krok 7: Request Caching
**Cel:** Decorator pattern dla HttpClient

```typescript
class CachedHttpClient implements HttpClient {
  constructor(private inner: HttpClient, private cache: Map<string, CacheEntry>) {}

  async execute(url, options): Promise<HttpResponse> {
    const key = this.getCacheKey(url, options);
    if (this.cache.has(key)) return this.cache.get(key);

    const response = await this.inner.execute(url, options);
    this.cache.set(key, response);
    return response;
  }
}
```

**Szacunkowy czas:** 4-5 godzin

### Krok 8: Request Retry Logic
**Cel:** Resilience pattern (exponential backoff)

```typescript
class RetryHttpClient implements HttpClient {
  async execute(url, options) {
    let lastError;
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.inner.execute(url, options);
      } catch (error) {
        lastError = error;
        await this.delay(Math.pow(2, i) * 100); // exponential backoff
      }
    }
    throw lastError;
  }
}
```

**Szacunkowy czas:** 3-4 godziny

### Krok 9: Rate Limiting
**Cel:** Middleware pattern dla request throttling

**Szacunkowy czas:** 4-5 godzin

### Krok 10: Request Batching
**Cel:** Batch multiple queries do jednego request (Apollo batch-link pattern)

**Szacunkowy czas:** 6-8 godzin

---

## 🎯 TIER 5: Dokumentacja i DevEx (LOW PRIORITY)

### Krok 11: Examples i Recipes
**Cel:** Praktyczne przykłady dla developerów

**Zawartość:**
- Custom HttpClient example (axios, node-fetch)
- Custom Logger example (console, file, ELK)
- Custom AuthStrategy example (OAuth2, JWT)
- Request caching example
- Retry logic example

**Szacunkowy czas:** 3-4 godziny

### Krok 12: Migration Guide
**Cel:** Dla zespołu jak korzystać z nowych feature'ów

**Zawartość:**
- Jak dodać custom HttpClient
- Jak dodać custom Logger
- Jak dodać custom AuthStrategy
- Jak migrować ze starego executeRequest

**Szacunkowy czas:** 2-3 godziny

### Krok 13: Performance Benchmarks
**Cel:** Porównanie before/after

**Mierzyć:**
- Bundle size
- Runtime performance
- Memory usage

**Szacunkowy czas:** 2-3 godziny

---

## 📊 Mapa Zależności

```
TIER 1 (Integration)
├── Krok 1: renia-magento-graphql-client
├── Krok 2: Aktualizacja callów executeRequest
└── (Zależy od): ✅ graphql-client refactoring

TIER 2 (Tests)
├── Krok 3: Unit testy
├── Krok 4: Integration testy
└── (Zależy od): TIER 1

TIER 3 (Other Modules)
├── Krok 5: magento-graphql-client SOLID
├── Krok 6: app/modules/renia/framework/api SOLID
└── (Zależy od): TIER 2 + analiza

TIER 4 (Advanced)
├── Krok 7: Caching
├── Krok 8: Retry logic
├── Krok 9: Rate limiting
├── Krok 10: Request batching
└── (Zależy od): TIER 2 (+ TIER 3 dla integration)

TIER 5 (DevEx)
├── Krok 11: Examples
├── Krok 12: Migration guide
├── Krok 13: Benchmarks
└── (Zależy od): Wszystkie powyższe
```

---

## 🎬 Rekomendowana Ścieżka

### Opcja A: "Quick Wins" (2-3 tygodnie)
1. ✅ graphql-client refactoring (already done)
2. **→ Krok 1-2: Integration z magento-graphql-client** (1-2 dni)
3. **→ Krok 3-4: Testy** (2-3 dni)
4. **→ Krok 11-12: Dokumentacja** (1 dzień)

**Rezultat:** Działający, przetestowany system gotowy do produkcji

---

### Opcja B: "Comprehensive" (4-6 tygodni)
1. ✅ graphql-client refactoring (already done)
2. **→ Tier 1 (Integration)** - 1 tydzień
3. **→ Tier 2 (Tests)** - 1.5 tygodnia
4. **→ Tier 3 (Other modules analysis + refactoring)** - 1-2 tygodnie
5. **→ Tier 4 (Advanced features)** - 1-1.5 tygodnia
6. **→ Tier 5 (DevEx)** - 3-4 dni

**Rezultat:** Kompletnie refaktoryzowany system z zaawansowanymi features

---

### Opcja C: "Minimal" (1 tydzień)
1. ✅ graphql-client refactoring (already done)
2. **→ Krok 1-2: Integration** (2-3 dni)
3. **→ Krok 3-4: Testy** (2-3 dni)

**Rezultat:** Working integration, brak dokumentacji/advanced features

---

## ❓ Pytania Decyzyjne

Przed wybraniem ścieżki, odpowiedz na:

1. **Deadline?** Ile czasu mamy?
2. **Priorytet?** Stabilność (testy) czy features (caching)?
3. **Zespół?** Ile osób może pracować równolegle?
4. **Kontekst?** Czy to urgent production fix czy long-term improvement?

---

## 🚀 Moja Rekomendacja

**Zacznij od Opcji A ("Quick Wins")**

Powody:
- ✅ Szybkie value delivery (2-3 tygodnie)
- ✅ Przetestowany kod
- ✅ Dokumentacja dla zespołu
- ✅ Ustabilizowana baza do dalszych ulepszeń
- ✅ Opcja na upgrade do Opcji B później

**Następnie (jeśli czas pozwoli):**
- Tier 3 analysis (czy inne moduły potrzebują refactoring?)
- Tier 4 features (caching, retry logic)
- Tier 5 benchmarks

---

## 📝 Kolejne Kroki do Podjęcia

### Teraz (dzisiaj):
1. ❓ Zdecyduj jakiej ścieżki chcesz (A/B/C)?
2. ❓ Ile czasu możemy poświęcić?
3. ❓ Czy ktoś jeszcze pracuje nad tym projektem?

### Gdy mamy odpowiedzi:
4. 📋 Utworzę szczegółowy plan dla wybranego TIER-u
5. 🎯 Zaczniemy implementację krok po kroku

---

**Gotowy na następny krok?** 🚀
