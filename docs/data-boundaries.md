

# Data Boundaries

This document defines frontend data contracts and ownership.

## ProductBase (PUBLIC)
- id, sku
- name, description
- images, media
- attributes
- URL, breadcrumbs

## ProductPricing (SEGMENT / PRIVATE)
- price
- tier prices
- discounts
- stock availability

## Rules
- ProductBase may be fetched in ISR
- ProductPricing must respect pricing mode
- UI components must not combine base and pricing fetches

## Responsibility
- Page components: ProductBase
- Pricing components: ProductPricing
# Granice danych

Ten dokument definiuje kontrakty danych po stronie frontendu.

## ProductBase (PUBLIC)
- id, sku
- nazwa, opis
- obrazy, media
- atrybuty
- URL, breadcrumbs

## ProductPricing (SEGMENT / PRIVATE)
- cena
- ceny progowe
- rabaty
- dostępność

## Zasady
- ProductBase może być pobierany w ISR
- ProductPricing musi respektować tryb cenowy
- Komponenty UI nie mogą łączyć fetchy base i pricing

## Odpowiedzialność
- Komponenty stron: ProductBase
- Komponenty cenowe: ProductPricing
# Granice danych

Ten dokument definiuje kontrakty danych po stronie frontendu.

## ProductBase (PUBLIC)
Dane „contentowe” produktu, stabilne i cache’owalne:
- id, sku
- nazwa, opis
- obrazy, media
- atrybuty
- URL, breadcrumbs

## ProductPricing (SEGMENT / PRIVATE)
Dane, które często zależą od kontekstu (trybu cenowego):
- cena
- ceny progowe
- rabaty

## ProductAvailability (SEGMENT / PRIVATE)
Dane o dostępności, które **zwykle** traktujemy podobnie jak cena, bo mogą zależeć od:
- źródeł/stocków, konfiguracji, regionu, klienta B2B

Przykład:
- W B2C „jest / nie ma” może być publiczne.
- W B2B dostępność może zależeć od magazynu/umowy → wtedy to jest PRIVATE.

## Promotions / Badges (PUBLIC / SEGMENT / PRIVATE)
- **PUBLIC:** globalna promocja dla wszystkich (badge „-20%” dla wszystkich)
- **SEGMENT:** promocja per customer group (badge widoczny tylko dla danej grupy)
- **PRIVATE:** promocje stricte „w koszyku”/negocjacje per klient (nie pokazujemy w shellu)

## Zasady
- ProductBase może być pobierany w ISR
- ProductPricing i ProductAvailability muszą respektować tryb cenowy i zakres cache
- Komponenty UI nie mogą łączyć fetchy base i pricing/availability w jednym „publicznym” fetchu

## Odpowiedzialność
- Komponenty stron: ProductBase
- Komponenty cenowe/dostępności: ProductPricing + ProductAvailability

## Wyjątek: „od ceny” w shellu
Dopuszczalne jest pokazanie w shellu wartości typu „od 199 zł” lub „cena po zalogowaniu”, jeśli:
- nie ujawnia to prywatnych/segmentowych cen
- jest traktowane jako element contentu (PUBLIC)
- właściwa cena jest pobierana osobno (SEGMENT/PRIVATE)