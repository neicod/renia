

# Granice danych

Ten dokument definiuje kontrakty danych po stronie frontendu oraz to, **co wolno cache’ować publicznie**.

## ProductBase (PUBLIC)
Dane „contentowe” produktu, stabilne i cache’owalne:
- id, sku
- nazwa, opis
- obrazy, media
- atrybuty
- URL, breadcrumbs

## ProductPricing (SEGMENT / PRIVATE)
Dane, które mogą zależeć od kontekstu (trybu cenowego):
- cena
- ceny progowe (tier prices)
- rabaty

## ProductAvailability (PUBLIC / SEGMENT / PRIVATE)
Dostępność/stock może być publiczna albo kontekstowa.

Przykłady:
- **PUBLIC:** prosty B2C – „jest / nie ma” takie samo dla wszystkich.
- **SEGMENT:** dostępność zależna od store/website/currency/region (np. różne magazyny per kraj).
- **PRIVATE:** B2B – dostępność zależna od umowy/klienta/magazynu przypisanego do firmy.

> Dlaczego często traktujemy availability podobnie jak pricing?
> Bo w wielu wdrożeniach B2B i/lub MSI dostępność potrafi zależeć od kontekstu równie mocno jak cena.

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
# Granice danych

Ten dokument definiuje kontrakty danych po stronie frontendu oraz to, **co wolno cache’ować publicznie**.

## ProductBase (PUBLIC)
Dane „contentowe” produktu, stabilne i cache’owalne:
- id, sku
- nazwa, opis
- obrazy, media
- atrybuty
- URL, breadcrumbs

## ProductPricing (SEGMENT / PRIVATE)
Dane, które mogą zależeć od kontekstu (trybu cenowego):
- cena
- ceny progowe (tier prices)
- rabaty

## ProductAvailability (PUBLIC / SEGMENT / PRIVATE)
Dostępność/stock może być publiczna albo kontekstowa.

Przykłady:
- **PUBLIC:** prosty B2C – „jest / nie ma” takie samo dla wszystkich.
- **SEGMENT:** dostępność zależna od store/website/currency/region (np. różne magazyny per kraj).
- **PRIVATE:** B2B – dostępność zależna od umowy/klienta/magazynu przypisanego do firmy.

> Dlaczego często traktujemy availability podobnie jak pricing?
> Bo w wielu wdrożeniach B2B i/lub MSI dostępność potrafi zależeć od kontekstu równie mocno jak cena.

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