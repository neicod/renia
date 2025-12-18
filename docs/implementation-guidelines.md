

# Implementation Guidelines

## Data Access Layer
- All GraphQL calls go through a single fetch abstraction
- Fetch functions declare scope: public | segment | private

## Components
- Page components load base data only
- Pricing components are isolated (PriceBlock, StockBlock)

## Next.js Rules
- Use ISR for catalog pages
- Use server components for private fragments
- Avoid client-side pricing logic

## Anti-Patterns
- One large GraphQL query for everything
- Conditional rendering based on pricing mode inside UI
- Passing auth context into static functions
# Wytyczne implementacyjne

## Warstwa dostępu do danych
- Wszystkie zapytania GraphQL przechodzą przez jedną abstrakcję fetch
- Każdy fetch deklaruje zakres: public | segment | private

## Komponenty
- Komponenty stron ładują wyłącznie dane base
- Komponenty cenowe są izolowane (PriceBlock, StockBlock)

## Zasady Next.js
- ISR dla stron katalogowych
- Server Components dla fragmentów prywatnych
- Brak logiki cenowej po stronie klienta

## Antywzorce
- Jedno wielkie zapytanie GraphQL
- Warunki pricing mode w UI
- Przekazywanie kontekstu auth do funkcji statycznych
# Wytyczne implementacyjne

## Słowniczek
- **PDP**: karta produktu (Product Detail Page)
- **PLP**: lista produktów / kategoria (Product Listing Page)
- **CMS**: strony treściowe
- **Shell**: część strony renderowana jako ISR (PUBLIC)
- **Wyspa (island)**: fragment renderowany osobno (SEGMENT/PRIVATE), np. cena

## Warstwa dostępu do danych (DAL)
- Wszystkie zapytania GraphQL przechodzą przez jedną abstrakcję fetch
- Każdy fetch deklaruje zakres: `public | segment | private`
- Cache key jest budowany wyłącznie z jawnych parametrów (store/locale/currency/groupId), nigdy z tokenów

## Komponenty
- Komponenty stron (PDP/PLP) ładują wyłącznie dane base (PUBLIC)
- Komponenty cenowe/dostępności są izolowane:
  - `PriceBlock`
  - `AvailabilityBlock`

## Jak to wygląda na przykładach

### Przykład A: PUBLIC (jedna cena)
- PDP shell (ISR) zawiera cenę
- PLP (ISR) zawiera ceny w listingu

### Przykład B: GROUP_FEW (max 5 grup)
- PDP shell (ISR) bez ceny lub z placeholder
- `PriceBlock` renderowany po stronie serwera i cache’owany per `groupId`
- PLP: preferuj „batch pricing” dla listy produktów (jeden request)

### Przykład C: GROUP_MANY / ACCOUNT
- PDP shell (ISR) bez ceny lub „cena po zalogowaniu”
- `PriceBlock` jako prywatny fragment (bez public cache)
- PLP: unikaj pobierania ceny dla każdego produktu osobno; preferuj prywatny fragment dla całej listy

## Zasady Next.js
- ISR dla stron katalogowych (PDP/PLP)
- Server Components / Route Handlers dla fragmentów prywatnych
- Unikamy logiki cenowej po stronie klienta (client fetch tylko jako ostateczny fallback UX)

## Antywzorce
- Jedno wielkie zapytanie GraphQL na base + pricing (ryzyko skażenia cache)
- Warunki `PRICING_MODE` rozlane po UI (decyzja ma być w DAL/strategii)
- Przekazywanie kontekstu auth do funkcji statycznych / cache’owanych