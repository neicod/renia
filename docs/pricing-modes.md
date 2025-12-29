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

---

## Segment (klucz cache) – co wchodzi i dlaczego
Domyślnie segment budujemy jako:
- `storeCode` + `currency` + `locale` + *(opcjonalnie)* `groupId`

### Kolejność pól (standard)
Zasada z tego repo:
1. `storeCode`
2. `currency`
3. `locale`
4. opcjonalne na końcu: `groupId` (tylko dla `GROUP_FEW/GROUP_MANY`)

### Dlaczego `currency` zawsze jest w kluczu
- Nawet jeśli dziś masz single-store i jedną walutę, to utrzymanie tej reguły eliminuje bugi przy późniejszym uruchomieniu multi-currency.

### `groupId` i „zalogowany vs niezalogowany”
- „zalogowany vs niezalogowany” **nie jest segmentem** sam w sobie, jeśli ceny są identyczne.
- `groupId` dokładamy do klucza **tylko wtedy**, gdy `PRICING_MODE` jest `GROUP_FEW` albo `GROUP_MANY` (czyli ceny faktycznie się różnią per grupa).

---

## Zasada przewodnia
Wraz ze wzrostem kardynalności przechodzimy z PUBLIC → SEGMENT → PRIVATE.
