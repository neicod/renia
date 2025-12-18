

# Cache Policy

## Cache Scopes

### PUBLIC
- No user-specific data
- Cacheable at CDN and ISR level
- Keys: store, locale, currency

### SEGMENT
- Limited personalization (e.g. customer group)
- Cacheable in Redis or Next.js data cache
- Keys: store, locale, groupId

### PRIVATE
- User or company specific
- Never cached publicly
- Optional short-lived session cache

## Forbidden Patterns
- Including auth tokens in cache keys
- Using force-cache with authenticated fetches
- Rendering private data in ISR pages

## Default Strategy
When in doubt:
- make the shell public
- make pricing private
# Polityka cache

## Zakresy cache

### PUBLIC
- Brak danych użytkownika
- Cache na poziomie CDN i ISR
- Klucze: store, locale, waluta

### SEGMENT
- Ograniczona personalizacja (np. customer group)
- Cache w Redis lub Next.js data cache
- Klucze: store, locale, groupId

### PRIVATE
- Dane specyficzne dla klienta lub firmy
- Nigdy nie cache’owane publicznie
- Opcjonalny cache krótkoterminowy per sesja

## Zabronione wzorce
- Dodawanie tokenów auth do kluczy cache
- `force-cache` dla requestów uwierzytelnionych
- Renderowanie danych prywatnych w ISR

## Strategia domyślna
Jeśli masz wątpliwości:
- shell zostaje publiczny
- cena staje się prywatna
# Polityka cache

## Zakresy cache

### PUBLIC
- Brak danych użytkownika
- Cache na poziomie CDN i ISR
- Klucze: `store`, `locale`, `currency`

### SEGMENT
- Ograniczona personalizacja (np. `customer group`)
- Cache w Redis lub Next.js data cache
- Klucze: `store`, `locale`, `currency`, `groupId`

### PRIVATE
- Dane specyficzne dla klienta lub firmy
- Nigdy nie cache’owane publicznie
- Opcjonalny cache krótkoterminowy per sesja

## Zabronione wzorce
- Dodawanie tokenów auth do kluczy cache
- `force-cache` dla requestów uwierzytelnionych
- Renderowanie danych prywatnych w ISR

## Propozycje TTL (domyślne)
To są wartości startowe – dostosujemy per projekt.

- **PUBLIC (content/base):** 5–30 min (ISR / CDN)
- **PUBLIC (cena w PUBLIC):** 1–10 min (zależnie od częstotliwości zmian)
- **SEGMENT (GROUP_FEW):** 30–120 s (per grupa) + opcjonalne tagowanie
- **PRIVATE (GROUP_MANY / ACCOUNT):** 0–30 s (najczęściej bez cache publicznego; ewentualnie cache per sesja)

## Strategia domyślna
Jeśli masz wątpliwości:
- shell zostaje publiczny
- cena i dostępność stają się prywatne