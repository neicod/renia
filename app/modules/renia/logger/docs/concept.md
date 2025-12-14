# Moduł renia/logger - Koncepcja

## Cel

Centralizowany system logowania z możliwością filtrowania logów po poziomach. Wrapper wokół `console` z wsparcie dla:
- Poziomów logów (DEBUG, INFO, WARN, ERROR)
- Filtrowania po minimalnym poziomie
- Tagów modułów
- Opcjonalnych metadanych

## Poziomy logów

| Poziom | Priorytet | Zastosowanie |
|--------|-----------|--------------|
| **DEBUG** | 0 (najniższy) | Szczegółowe informacje dla debugowania (zmienne, flow) |
| **INFO** | 1 | Ogólne informacje o działaniu (requesty, odpowiedzi) |
| **WARN** | 2 | Ostrzeżenia, potencjalne problemy (fallback values) |
| **ERROR** | 3 (najwyższy) | Błędy, wyjątki, problemy krytyczne |

## Konfiguracja

```typescript
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LoggerConfig {
  minLevel: LogLevel;              // Minimalny poziom do wyświetlania
  enableTimestamp?: boolean;       // Pokazywać timestamp (domyślnie: true)
  enableModule?: boolean;          // Pokazywać moduł (domyślnie: true)
  environment?: 'development' | 'production';  // Ustawienia per environment
}
```

**Domyślna konfiguracja:**
- Development: `minLevel: 'DEBUG'` - wszystkie logi
- Production: `minLevel: 'WARN'` - tylko warnings i errors

## API

### Inicjalizacja

```typescript
import { initLogger, getLogger } from 'renia-logger';

// Na starcie aplikacji
initLogger({
  minLevel: 'INFO',
  enableTimestamp: true,
  environment: 'development'
});

// Potem wszędzie
const logger = getLogger();
```

### Logowanie

```typescript
const logger = getLogger();

logger.debug('ProductPage', 'Loading product', { urlKey: 'test' });
// [DEBUG] [10:30:45] ProductPage: Loading product { urlKey: 'test' }

logger.info('fetchProduct', 'GraphQL request', { query: '...' });
// [INFO] [10:30:46] fetchProduct: GraphQL request { query: '...' }

logger.warn('useProduct', 'No product found');
// [WARN] [10:30:47] useProduct: No product found

logger.error('fetchProduct', 'GraphQL error', { errors: [...] });
// [ERROR] [10:30:48] fetchProduct: GraphQL error { errors: [...] }
```

### Formatowanie wyjścia

Domyślny format:
```
[LEVEL] [HH:MM:SS] module: message { data }
```

Kolory w konsoli:
- DEBUG: gray
- INFO: blue
- WARN: orange/yellow
- ERROR: red

## Przypadki użycia

### GraphQL Query/Response (poziom INFO)

```typescript
logger.info('fetchProduct', 'GraphQL request', {
  query: buildProductDetailQuery(...).toString(),
  variables: { ... }
});

logger.info('fetchProduct', 'GraphQL response', {
  statusCode: 200,
  itemCount: 5
});
```

### Mapowanie danych (poziom DEBUG)

```typescript
logger.debug('productMapper', 'Mapping simple product', {
  __typename: item.__typename,
  sku: item.sku
});
```

### Błędy (poziom ERROR)

```typescript
logger.error('fetchProduct', 'Failed to fetch', {
  error: err.message,
  statusCode: err.statusCode
});
```

## Struktura modułu

### Katalog główny (tylko niezbędne pliki):
```
app/modules/renia/logger/
├── package.json             # Metadane modułu
├── registration.js          # Rejestracja modułu (wymagane dla frameworka)
├── index.ts                 # Public API - eksporty dla użytkowników
└── ... (reszta w podkatalogach)
```

### Pełna struktura:
```
app/modules/renia/logger/
├── package.json
├── registration.js
├── index.ts
├── types/
│   └── logger.ts            # LogLevel, LoggerConfig, Logger interface
├── services/
│   ├── logger.ts            # Główna implementacja
│   └── loggerConfig.ts      # Zarządzanie konfiguracją
├── utils/
│   ├── formatters.ts        # Formatowanie wyjścia
│   └── colors.ts            # Kolory dla konsoli
├── hooks/
│   └── useLogger.ts         # React hook dla logowania
└── docs/
    └── concept.md           # Dokumentacja
```

### 📋 Wymagania struktury modułu (standard dla wszystkich renia/*)

**Katalog główny - TYLKO:**
- ✅ `package.json` - Definicja pakietu (nazwa, dependencies, exports)
- ✅ `registration.js` - Rejestracja modułu w frameworku (wymagane)
- ✅ `index.ts` - Publiczne API (co eksportujemy)
- ❌ Brak innych plików na głównym poziomie

**Podkatalogi - Zorganizowana struktura:**
- `types/` - Interfejsy i typy TypeScript
- `services/` - Logika biznesowa, obsługa API
- `utils/` - Funkcje pomocnicze
- `hooks/` - React hooks (jeśli dotyczy)
- `components/` - React komponenty (jeśli dotyczy)
- `pages/` - Strony (jeśli dotyczy)
- `docs/` - Dokumentacja (concept.md, README)

**Zasada "czyste główne katalogi":**
- Ułatwiamy nawigację (widać od razu co eksportuje moduł)
- Logiczna separacja concerns
- Przygotowuję dla agentów kierunkowe sugestie
- Konsystencja między modułami

## Filtry i warunki

Jeśli `minLevel: 'INFO'`, będą wyświetlane:
- ✅ INFO
- ✅ WARN
- ✅ ERROR
- ❌ DEBUG

## Environment-specific konfiguracja

```typescript
const config = {
  development: {
    minLevel: 'DEBUG',
    enableTimestamp: true
  },
  production: {
    minLevel: 'WARN',
    enableTimestamp: true
  }
};

initLogger(config[process.env.NODE_ENV]);
```

## Opcjonalne cechy (Future)

- Eksport logów do pliku
- Remote logging (wysyłanie do serwera)
- Log grouping/collapsing w konsoli
- Integration z error tracking (Sentry)
- Sampling dla production (logować co N-ty request)

## Kompatybilność

- SSR: Wspiera zarówno serwer (Node.js) jak i klient (Browser)
- @env: mixed - działać będzie wszędzie

## Przykład integracji z naszymi modułami

### W fetchProduct:

```typescript
import { getLogger } from 'renia-logger';

const logger = getLogger();

export const fetchProduct = async (options) => {
  logger.info('fetchProduct', 'Starting', { urlKey: options.urlKey });

  const res = await executeGraphQLRequest(req);
  logger.info('fetchProduct', 'GraphQL response', {
    status: res.status,
    hasErrors: !!res.errors
  });

  if (res.errors) {
    logger.error('fetchProduct', 'GraphQL errors', { errors: res.errors });
    throw new Error(...);
  }

  logger.debug('fetchProduct', 'Mapping product', { __typename: items[0].__typename });
  return mapProduct(items[0]);
};
```

### W productMapper:

```typescript
import { getLogger } from 'renia-logger';

const logger = getLogger();

const simpleProductMapper = {
  map(item) {
    logger.debug('simpleProductMapper', 'Mapping', { sku: item.sku });
    return { ... };
  }
};
```

## Notatki

- Logowanie powinno być minimalne na production
- INFO level idealny dla GraphQL (vidać co się dzieje bez szumu)
- DEBUG level dla developerów debugujących specific issues
- Error level nigdy nie powinien być wyłączony
