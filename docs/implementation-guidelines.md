


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
- **Shell**: część strony renderowana na serwerze Express (PUBLIC, cache CDN/Varnish)
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
- Linki i query buduj przez helpery frameworka (np. `@renia/framework/router/paths#toAbsolutePath`, `@renia/framework/router/paths#dedupeSearch`) zamiast ręcznych `\`/${...}\`` i regexów – to eliminuje niespójności (`//`, brak `/`, duplikaty kluczy w query).
- Stan listingu (PLP + search) jest synchronizowany z URL:
  - `page`, `pageSize`, `sort` (aliasy mogą występować w starych URL-ach, ale zapisujemy tylko klucze kanoniczne)
  - query search term: `q` (legacy `query` jest normalizowane do `q`)
  - helpery: `@renia/framework/router/listingQuery` (`readListingQueryState`, `applyListingQuery`, `normalizeListingQuery`, `normalizeSearchTermKey`)

## Jak to wygląda na przykładach

### Przykład A: PUBLIC (jedna cena)
- PDP shell (SSR) zawiera cenę
- PLP (SSR) zawiera ceny w listingu

### Przykład B: GROUP_FEW (max 5 grup)
- PDP shell (SSR) bez ceny lub z placeholder
- `PriceBlock` renderowany po stronie serwera i cache’owany per `groupId`
- PLP: preferuj „batch pricing” dla listy produktów (jeden request)

### Przykład C: GROUP_MANY / ACCOUNT
- PDP shell (SSR) bez ceny lub „cena po zalogowaniu”
- `PriceBlock` jako prywatny fragment (bez public cache)
- PLP: unikaj pobierania ceny dla każdego produktu osobno; preferuj prywatny fragment dla całej listy

## Zasady renderingu (Express + CDN)
- Shell renderujemy na serwerze i pozwalamy CDN/Varnish cache’ować go dla PUBLIC zakresów.
- Fragmenty SEGMENT/PRIVATE renderujemy jako osobne fetch’e SSR (krótkie TTL) albo dowozimy po stronie klienta; nigdy nie mieszamy ich z shellem.
- Unikamy logiki cenowej po stronie klienta – fetch w kliencie to tylko fallback UX, preferujemy SSR fetch + kontrolowane cache.

## Antywzorce
- Jedno wielkie zapytanie GraphQL na base + pricing (ryzyko skażenia cache)
- Warunki `PRICING_MODE` rozlane po UI (decyzja ma być w DAL/strategii)
- Przekazywanie kontekstu auth do funkcji statycznych / cache’owanych
