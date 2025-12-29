# Matryca renderowania

## Słowniczek
- **PDP** – Product Detail Page (karta produktu)
- **PLP** – Product Listing Page (kategoria/wyszukiwarka)
- **CMS** – Strony kontentowe (np. „O nas”, landing)

## Domyślna zasada
- Shell strony (content/base) renderujemy na serwerze Express i cache’ujemy na poziomie CDN/Varnish jako PUBLIC fragment.
- Dane kontekstowe (cena, dostępność, badge’e, uprawnienia) traktujemy jako wyspy SEGMENT/PRIVATE i ładujemy osobno (SSR fetch + cache o krótkim TTL lub wyłącznie po stronie klienta).

## Matryca (wysokopoziomowa)

| Tryb cenowy | Shell (PDP/PLP)                            | Cena / dostępność                 | Zakres cache dla ceny |
|-------------|--------------------------------------------|-----------------------------------|-----------------------|
| PUBLIC      | SSR + CDN cache (PUBLIC)                   | renderowana w shellu              | PUBLIC                |
| GROUP_FEW   | SSR + CDN cache (PUBLIC)                   | SSR fetch + cache per `groupId`   | SEGMENT               |
| GROUP_MANY  | SSR + CDN cache (PUBLIC)                   | SSR prywatny lub klientowy fetch  | PRIVATE               |
| ACCOUNT     | SSR + CDN cache (PUBLIC)                   | SSR prywatny (bez public cache)   | PRIVATE               |

## PDP (karta produktu)
- Wyspa ceny/dostępności to pojedynczy komponent → łatwo wyizolować SSR fetch.
- W `GROUP_FEW` można cachować wynik per `groupId` (np. Redis / in-memory).
- W `GROUP_MANY/ACCOUNT` pokazujemy placeholder („cena po zalogowaniu”) i ładujemy cenę prywatnie.

## PLP (lista produktów)
- Kosztowna sekcja – unikaj fetchy „per kafelek”.
- `GROUP_FEW`: preferuj batch pricing (jeden request dla całej listy) + cache per `groupId`.
- `GROUP_MANY/ACCOUNT`: prywatny fragment dla całego listingu lub placeholdery i późniejsze doładowanie.

## CMS
- Zwykle w pełni PUBLIC: shell SSR + CDN cache, brak wysp segmentowych.
- Jeśli CMS wstrzykuje moduły z dynamicznymi danymi (np. cenę w hotspocie), traktuj je jak PLP/PDP i stosuj zasady z tabeli.
