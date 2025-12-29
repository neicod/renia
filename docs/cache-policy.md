

# Polityka cache

> **Status implementacji (grudzień 2025):** bieżący runtime nie posiada jeszcze docelowej warstwy DAL/cache zgodnej z poniższą specyfikacją. Istnieją natomiast tymczasowe cache'e in-memory (np. w `renia-magento-routing` i prefetch menu), które mają ograniczyć liczbę requestów do Magento, ale nie zastępują docelowego DAL/Redis.

## Tymczasowe cache'e runtime (in-memory)

Do czasu wdrożenia docelowego DAL/Redis, część elementów może być cachowana w pamięci procesu:
- **Magento routing** (`renia-magento-routing`): wyniki `urlResolver` i podstawowe payloady (PDP/PLP/CMS).
  - `RENIA_MAGENTO_ROUTING_CACHE_TTL_MS` (domyślnie `30000`, `0` wyłącza)
  - `RENIA_MAGENTO_ROUTING_CACHE_MAX_ENTRIES` (domyślnie `2000`)

## Zakresy cache

### PUBLIC
- Brak danych użytkownika
- Cache na poziomie CDN/Varnish lub innego reverse proxy
- Klucze: `storeCode`, `currency`, `locale`

### SEGMENT
- Ograniczona personalizacja (np. `customer group`)
- Cache w Redis lub serwerowej warstwie danych (np. in-memory cache)
- Klucze: `storeCode`, `currency`, `locale`, `groupId`

### PRIVATE
- Dane specyficzne dla klienta lub firmy
- Nigdy nie cache’owane publicznie
- Opcjonalny cache krótkoterminowy per sesja

---

## Standard klucza cache (format)

### Założenia
- **Zawsze zaczynamy od:** `storeCode`, potem `currency`.
- Pola opcjonalne dokładamy na końcu.
- **Nigdy** nie używamy tokenów/sesji jako części klucza.

### Format (string)
Rekomendowany format klucza (czytelny i deterministyczny):

`{storeCode}:{currency}:{locale}:{scope}:{groupId?}:{routeKey?}:{queryHash}:{varsHash}`

Gdzie:
- `storeCode` – kod store view
- `currency` – kod waluty (np. PLN, EUR)
- `locale` – locale (np. pl_PL)
- `scope` – `public | segment | private`
- `groupId?` – tylko gdy tryb cenowy tego wymaga (`GROUP_FEW/GROUP_MANY`)
- `routeKey?` – opcjonalnie: identyfikator kontekstu strony (np. `sku=...`, `category=...`, `page=2`, `sort=...`, `filters=...`)
- `queryHash` – hash zapytania GraphQL (lub identyfikator persisted query)
- `varsHash` – hash zmiennych

> W praktyce dla cache fetchy w DAL najważniejsze są: `storeCode:currency:locale:(groupId?):queryHash:varsHash`.

### Przykłady
- **PUBLIC, PDP base:** `pl:PLN:pl_PL:public:productBase:Q123:V456`
- **GROUP_FEW, batch pricing PLP (groupId=3):** `pl:PLN:pl_PL:segment:3:plp_page=2_sort=price:QPR:VABC`

---

## Zabronione wzorce
- Dodawanie tokenów auth do kluczy cache
- `force-cache` dla requestów uwierzytelnionych
- Renderowanie danych prywatnych w PUBLIC shellu

---

## Propozycje TTL (domyślne)
To są wartości startowe – dostosujemy per projekt.

- **PUBLIC (content/base):** 5–30 min (CDN/Varnish)
- **PUBLIC (cena w PUBLIC):** 1–10 min (zależnie od częstotliwości zmian)
- **SEGMENT (GROUP_FEW):** **10 min** (produkcyjny default) – konfigurowalne
- **PRIVATE (GROUP_MANY / ACCOUNT):** 0–30 s (najczęściej bez cache publicznego; ewentualnie cache per sesja)

---

## Konfiguracja / wyłączanie cache
- Cache musi być **konfigurowalny** per tenant i per scope.
- Cache musi dać się **wyłączyć** (np. TTL=0 albo `no-store`).

---

## Strategia domyślna
Jeśli masz wątpliwości:
- shell zostaje publiczny
- cena i dostępność stają się prywatne
