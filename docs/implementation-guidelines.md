


# Wytyczne implementacyjne

## Standardy jakości (SOLID)
Pisząc kod w tym repozytorium stosujemy zasady **SOLID**.

W praktyce oznacza to m.in.:
- **S** (Single Responsibility): jedna odpowiedzialność na moduł/serwis/komponent (bez „kombajnów”).
- **O** (Open/Closed): rozszerzamy przez moduły/sloty/strategie, nie przez edycję core.
- **L** (Liskov): strategie/implementacje muszą być podstawialne bez efektów ubocznych.
- **I** (Interface Segregation): małe, celowane kontrakty (np. osobno base vs pricing).
- **D** (Dependency Inversion): UI/domena zależą od abstrakcji (DAL/kontrakty), nie od klienta backendu.

> Jeśli jakaś zmiana łamie SOLID, należy ją przeprojektować (albo uzasadnić wyjątek w PR).

## Słowniczek
- **PDP**: karta produktu (Product Detail Page)
- **PLP**: lista produktów / kategoria (Product Listing Page)
- **CMS**: strony treściowe
- **Shell**: część strony renderowana jako ISR (PUBLIC)
- **Wyspa (island)**: fragment renderowany osobno (SEGMENT/PRIVATE), np. cena

## Warstwa dostępu do danych (DAL)
- Wszystkie zapytania GraphQL przechodzą przez jedną abstrakcję fetch
- Każdy fetch deklaruje zakres: `public | segment | private`
- Cache key budujemy standardowo (patrz: `cache-policy.md`) i zaczynamy od `storeCode:currency:...`
- Cache key jest budowany wyłącznie z jawnych parametrów (storeCode/currency/locale/groupId), nigdy z tokenów

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