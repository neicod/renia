

# Architektura

## Cel
Zbudowanie wielokrotnego użytku, wysokowydajnej bazy frontendowej w Next.js (App Router) dla projektów headless Magento (B2C i B2B), możliwej do dostosowania do różnych modeli cenowych, store’ów i personalizacji.

Magento jest traktowane wyłącznie jako dostawca danych. Cała logika renderowania, cache i personalizacji znajduje się po stronie frontendu.

## Główne zasady
- Domyślnie używamy renderowania statycznego lub przyrostowego (ISR)
- Rozdzielamy content (base) od personalizacji (ceny, dostępność)
- Cache’ujemy agresywnie tam, gdzie kardynalność jest niska
- Unikamy SSR, jeśli nie daje mierzalnej wartości
- Pilnujemy poprawności kontekstu requestów (storeCode/currency/locale/groupId), aby backend (Magento + Varnish) zwrócił właściwe dane
- Kod utrzymujemy zgodny z zasadami SOLID (SRP, DI, małe kontrakty)

## Model wysokopoziomowy

### Page Shell
- Renderowany jako ISR
- Zawiera wyłącznie publiczne, niespersonalizowane dane
- Może być cache’owany na poziomie CDN

### Wyspy segmentowe / prywatne
- Cena, dostępność, badge’e promocyjne, uprawnienia
- Renderowane przez SSR lub server-side fetch
- Zakres cache zależy od trybu cenowego

## Zakresy danych
- PUBLIC: identyczne dla wszystkich użytkowników
- SEGMENT: zależne od `storeCode`, `currency`, `locale` lub `customer group`
- PRIVATE: zależne od konkretnego klienta lub firmy

## Poza zakresem
- Full SSR dla całego katalogu
- Duplikowanie logiki biznesowej Magento na froncie
- Strategie cache zależne od tokenów użytkownika
# Architektura

## Cel
Zbudowanie wielokrotnego użytku, wysokowydajnej bazy frontendowej w Next.js (App Router) dla projektów headless Magento (B2C i B2B), możliwej do dostosowania do różnych modeli cenowych, store’ów i personalizacji.

Magento jest traktowane wyłącznie jako dostawca danych. Cała logika renderowania, cache i personalizacji znajduje się po stronie frontendu.

## Główne zasady
- Domyślnie używamy renderowania statycznego lub przyrostowego (ISR)
- Rozdzielamy content (base) od personalizacji (ceny, dostępność)
- Cache’ujemy agresywnie tam, gdzie kardynalność jest niska
- Unikamy SSR, jeśli nie daje mierzalnej wartości
- Nigdy nie mieszamy kontekstu uwierzytelnienia z publicznym cache

## Model wysokopoziomowy

### Page Shell
- Renderowany jako ISR
- Zawiera wyłącznie publiczne, niespersonalizowane dane
- Może być cache’owany na poziomie CDN

### Wyspy prywatne / segmentowe
- Cena, stock, promocje, uprawnienia
- Renderowane przez SSR lub server-side fetch
- Zakres cache zależy od trybu cenowego

## Zakresy danych
- PUBLIC: identyczne dla wszystkich użytkowników
- SEGMENT: zależne od store, locale, waluty lub customer group
- PRIVATE: zależne od konkretnego klienta lub firmy

## Poza zakresem
- Full SSR dla całego katalogu
- Duplikowanie logiki biznesowej Magento na froncie
- Strategie cache zależne od tokenów użytkownika
# Architektura

## Cel
Zbudowanie wielokrotnego użytku, wysokowydajnej bazy frontendowej w Next.js (App Router) dla projektów headless Magento (B2C i B2B), możliwej do dostosowania do różnych modeli cenowych, store’ów i personalizacji.

Magento jest traktowane wyłącznie jako dostawca danych. Cała logika renderowania, cache i personalizacji znajduje się po stronie frontendu.

## Główne zasady
- Domyślnie używamy renderowania statycznego lub przyrostowego (ISR)
- Rozdzielamy content (base) od personalizacji (ceny, dostępność)
- Cache’ujemy agresywnie tam, gdzie kardynalność jest niska
- Unikamy SSR, jeśli nie daje mierzalnej wartości
- Pilnujemy poprawności kontekstu requestów (storeCode/currency/locale/groupId), aby backend (Magento + Varnish) zwrócił właściwe dane
- Kod utrzymujemy zgodny z zasadami SOLID (SRP, DI, małe kontrakty)

## Model wysokopoziomowy

### Page Shell
- Renderowany jako ISR
- Zawiera wyłącznie publiczne, niespersonalizowane dane
- Może być cache’owany na poziomie CDN

### Wyspy segmentowe / prywatne
- Cena, dostępność, badge’e promocyjne, uprawnienia
- Renderowane przez SSR lub server-side fetch
- Zakres cache zależy od trybu cenowego

## Zakresy danych
- PUBLIC: identyczne dla wszystkich użytkowników
- SEGMENT: zależne od `storeCode`, `currency`, `locale` lub `customer group`
- PRIVATE: zależne od konkretnego klienta lub firmy

## Poza zakresem
- Full SSR dla całego katalogu
- Duplikowanie logiki biznesowej Magento na froncie
- Strategie cache zależne od tokenów użytkownika