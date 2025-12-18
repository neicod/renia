

# Pricing Modes

Pricing modes define how product prices are fetched, rendered, and cached on the frontend.

## PUBLIC
- One price per store/website
- No customer context required
- Fully cacheable

Use cases:
- B2C stores with universal pricing

## GROUP_FEW (Low Cardinality)
- Prices differ per customer group
- Small number of groups (typically <10)

Characteristics:
- Cache per group is viable
- Price can be rendered server-side and cached

Typical use cases:
- Wholesale vs retail pricing
- Logged-in B2C segmentation

## GROUP_MANY (High Cardinality)
- Prices differ per group or company
- Large or dynamic number of groups

Characteristics:
- Cache per group is inefficient
- Price rendered as private fragment

Typical use cases:
- B2B catalogs with many companies

## ACCOUNT
- Prices negotiated per customer or company
- Requires authenticated context

Characteristics:
- No public or segment cache
- Always private SSR fetch

## Guiding Rule
As cardinality increases, move pricing from public → segment → private scope.
# Tryby cenowe

Tryby cenowe definiują sposób pobierania, renderowania i cache’owania cen na froncie.

## PUBLIC
- Jedna cena w obrębie store/website
- Brak kontekstu klienta
- W pełni cache’owalne

Zastosowanie:
- Sklepy B2C z jedną ceną dla wszystkich

## GROUP_FEW (niska kardynalność)
- Ceny różne per customer group
- Mała liczba grup (zwykle <10)

Charakterystyka:
- Cache per grupa jest opłacalny
- Cena może być renderowana po stronie serwera i cache’owana

Zastosowanie:
- Retail vs wholesale
- Segmentacja zalogowanych klientów B2C

## GROUP_MANY (wysoka kardynalność)
- Ceny różne per grupa lub firma
- Duża lub dynamiczna liczba grup

Charakterystyka:
- Cache per grupa jest nieefektywny
- Cena jako prywatny fragment

Zastosowanie:
- Katalogi B2B z wieloma firmami

## ACCOUNT
- Ceny negocjowane per klient / firma
- Wymaga uwierzytelnienia

Charakterystyka:
- Brak publicznego i segmentowego cache
- Zawsze prywatny SSR fetch

## Zasada przewodnia
Wraz ze wzrostem kardynalności przechodzimy z PUBLIC → SEGMENT → PRIVATE.
# Tryby cenowe

Tryby cenowe definiują sposób pobierania, renderowania i cache’owania cen na froncie.

## PUBLIC
- Jedna cena w obrębie store/website
- Brak kontekstu klienta
- W pełni cache’owalne

Zastosowanie:
- Sklepy B2C z jedną ceną dla wszystkich

## GROUP_FEW (niska kardynalność)
- Ceny różne per customer group
- Mała liczba grup: **max 5** (domyślna definicja w tym repo)

Charakterystyka:
- Cache per grupa jest opłacalny (wysoki cache hit-rate)
- Cena może być renderowana po stronie serwera i cache’owana w zakresie SEGMENT

Zastosowanie:
- Retail vs wholesale
- Proste segmentacje zalogowanych klientów B2C

## GROUP_MANY (wysoka kardynalność)
- Ceny różne per grupa lub firma
- Duża lub dynamiczna liczba grup (zwykle B2B)

Charakterystyka:
- Cache per grupa jest nieefektywny (niski hit-rate)
- Cena jako prywatny fragment (PRIVATE) albo krótko-żyjący cache per sesja

Zastosowanie:
- Katalogi B2B z wieloma firmami

## ACCOUNT
- Ceny negocjowane per klient / firma
- Wymaga uwierzytelnienia

Charakterystyka:
- Brak publicznego i segmentowego cache
- Zawsze prywatny SSR fetch

## Co wchodzi do „segmentu” (klucza cache)
Domyślnie segment budujemy jako:
- `store` + `locale` + `currency` + *(opcjonalnie)* `groupId`

Uwagi:
- `currency` jest częścią klucza zawsze, nawet jeśli w danym single-store jest stała. To upraszcza reguły i eliminuje przypadkowe bugi po włączeniu multi-currency.
- `groupId` dodajemy tylko w trybach `GROUP_FEW` / `GROUP_MANY`.
- „zalogowany vs niezalogowany” NIE jest segmentem sam w sobie, jeśli ceny są identyczne. To tylko inny stan UI (np. dostęp do konta), ale nie zmienia cache dla ceny.

## Zasada przewodnia
Wraz ze wzrostem kardynalności przechodzimy z PUBLIC → SEGMENT → PRIVATE.