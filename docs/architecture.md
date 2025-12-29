# Architektura

## Cel
Zbudowanie wielokrotnego użytku, wysokowydajnej bazy frontendowej w **React + Express SSR** dla projektów headless Magento (B2C i B2B). Frontend odpowiada za składanie layoutu, routing i cache shellu, a Magento jest traktowane jak dostawca danych (GraphQL/REST).

## Stos technologiczny (stan bieżący)
- **Serwer**: własny serwer Express (`app/entry/server/index.tsx`) z `renderToString`, routingiem HTTP i proxy GraphQL.
- **Routing aplikacji**: React Router (SSR + CSR), konfiguracja tras ładowana z modułów.
- **Layout**: autorski system `LayoutTreeBuilder` + interceptory modułów (`app/modules/**/interceptors`), opisany w `app/modules/renia/framework/layout/README.md`.
- **Budowanie**: `esbuild` dla klienta + `tsx`/TypeScript dla serwera.
- **Cache shellu**: zakładamy reverse proxy/CDN (np. Varnish) przed serwerem, które może cachować publiczny HTML. Warstwa DAL/cache na poziomie fetchy jest w planach (patrz `cache-policy.md`).
- **Cache routingu (tymczasowy)**: runtime może cachować w pamięci (TTL) wyniki `urlResolver` i podstawowe payloady routingu (PDP/PLP/CMS) w module `renia-magento-routing` — do czasu wdrożenia docelowej warstwy DAL/cache.

## Główne zasady
- **Shell SSR + wyspy**: publiczny content renderujemy na serwerze i cache’ujemy agresywnie; dane kontekstowe (ceny, dostępność, uprawnienia) ładowane są jako wyspy segmentowe/prywatne.
- **Oddzielne zakresy danych**: PUBLIC / SEGMENT / PRIVATE (patrz `data-boundaries.md` i `pricing-modes.md`).
- **Brak tokenów w cache**: cache opiera się na kontekście store/currency/locale/group.
- **SOLID + modularyzacja**: logika pochodzi z modułów, komunikacja z backendem przez dedykowane pakiety (np. `renia-graphql-client`).
- **Konfigurowalność**: aktywne moduły określa `app/etc/config.json`; interceptory budują layout kontekstowo.

## Model wysokopoziomowy

### Page Shell (PUBLIC)
- Renderowany na serwerze Express przy każdym żądaniu.
- Może być cachowany na poziomie CDN/Varnish (np. per `storeCode/currency/locale`).
- Zawiera layout, content statyczny, placeholdery dla fragmentów kontekstowych.

### Wyspy segmentowe / prywatne
- Ceny, dostępność, akcje użytkownika itd.
- Mogą korzystać z SSR fetchy (z krótkim TTL) lub klientowych requestów; zakres cache zależy od trybu cenowego.
- Rejestrowane w layoutach przez interceptory (np. `api.extend.component(...).outlet(...)`).

## Zakresy danych
- **PUBLIC** – identyczne dla wszystkich (shell, CMS, content).
- **SEGMENT** – zależne od `storeCode`, `currency`, `locale`, `groupId`.
- **PRIVATE** – zależne od konkretnego klienta/sesji (brak publicznego cache).

## Poza zakresem
- Full SSR całego katalogu z danymi prywatnymi w HTML.
- Strategie cache oparte na tokenach użytkownika lub sesji.
