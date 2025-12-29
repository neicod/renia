
# Moduły aplikacji

Ten dokument opisuje **architekturę modułową aplikacji** oraz zasady projektowania i integracji modułów.
Nie opisujemy tutaj logiki domenowej (np. produktów, koszyka, checkoutu), a jedynie **role techniczne modułów** i ich wzajemne zależności.

Celem jest możliwość budowania **wielu wariantów aplikacji** (różni klienci, różne wymagania) poprzez włączanie/wyłączanie modułów oraz ich konfigurację – bez zmiany core aplikacji.

---

## Czym jest moduł

Moduł to **niezależna paczka aplikacyjna**, która:
- posiada własny `package.json`,
- może dostarczać komponenty React, serwisy, interceptory, trasy, kontekst,
- może być włączana lub wyłączana konfiguracyjnie,
- komunikuje się z resztą systemu wyłącznie przez **jawne kontrakty**.

Moduły mogą znajdować się w:
- `app/modules/<vendor>/<module>` (**zalecane**), albo
- historycznym `modules/`.

> Jeśli moduł znajduje się w `app/modules/...`, należy dodać zależność
> `npm install <nazwa>@file:app/modules/<vendor>/<module>`, aby działał jak standardowa paczka npm.

---

## Rejestracja endpointów serwera (Express)

Niektóre moduły (np. integracje) mogą potrzebować zarejestrować własne endpointy Express (proxy, webhooks, itp.).
Żeby `app/modules/renia/framework/` nie zawierał wiedzy domenowej (np. “Magento”), moduł może dostarczyć plik:

- `registerServer.ts` (lub `.js/.mjs/.cjs`) w katalogu modułu.

Ten plik powinien eksportować funkcję `default` lub `registerServer(app, ctx)`.
Framework ładuje te pliki automatycznie przy starcie serwera (tylko dla enabled modules).

Przykład:

```ts
// @env: server
import type { Application } from 'express';

export default function registerServer(app: Application) {
  app.post('/api/vendor/webhook', (req, res) => res.status(204).end());
}
```

---

## Aktywacja modułów

Moduły są aktywowane poprzez konfigurację:

```
app/etc/config.json
modules.<nazwa_modułu> = 1
```

Brak wpisu oznacza, że moduł jest **nieaktywny**.

> Dzięki temu ten sam kod bazowy może obsługiwać różne konfiguracje klientów.

---

## Typy modułów (role techniczne)

### 1. Moduły infrastrukturalne
Odpowiadają za fundament aplikacji i są wykorzystywane przez wszystkie inne moduły.

Przykładowe odpowiedzialności:
- system layoutów i slotów,
- mechanizm interceptorów,
- bootstrapping aplikacji,
- globalne konteksty.

Zasady:
- nie zależą od modułów domenowych,
- nie zawierają logiki biznesowej.

---

### 2. Moduły integracyjne (API / backend)
Odpowiadają za komunikację z backendami (np. Magento) i normalizację danych.

Przykładowe odpowiedzialności:
- klient GraphQL / HTTP,
- fabryki requestów,
- mapowanie kontekstu aplikacji na parametry zapytań (store, currency, locale, group),
- obsługa nagłówków i endpointów.

Zasady:
- cała komunikacja z backendem przechodzi przez te moduły,
- moduły UI **nie komunikują się bezpośrednio z backendem**.

---

### 3. Moduły kontekstu i cache
Odpowiadają za **kontekst requestów** i **spójność cache** w aplikacji.

Przykładowe odpowiedzialności:
- budowa kontekstu (`storeCode`, `currency`, `locale`, `groupId`),
- standard klucza cache (zgodnie z `cache-policy.md`),
- decyzja o zakresie cache: `PUBLIC / SEGMENT / PRIVATE`,
- integracja z cache serwera (np. Redis / in-memory) oraz storage przeglądarki.

Zasady:
- jeden właściciel kontekstu i klucza cache w całej aplikacji,
- brak logiki domenowej.

---

### 4. Moduły domenowe
Implementują **konkretne obszary funkcjonalne aplikacji**, korzystając z infrastruktury i integracji.

Przykładowe odpowiedzialności:
- logika listowania danych,
- logika szczegółów widoków,
- akcje użytkownika,
- powiązane komponenty UI.

Zasady:
- korzystają z modułów integracyjnych i kontekstu,
- nie implementują własnego transportu ani cache.

---

### 5. Moduły UI / prezentacyjne
Dostarczają komponenty wizualne i interakcje użytkownika.

Przykładowe odpowiedzialności:
- komponenty React,
- hooki UI,
- integracja ze slotami layoutu.

Zasady:
- brak bezpośredniej komunikacji z backendem,
- logika danych pochodzi z modułów domenowych.

---

## Layout, sloty i interceptory

Aplikacja korzysta z **systemu layoutów i slotów**, którego implementacja znajduje się w `framework/layout`.

System ten umożliwia modułom:
- wstrzykiwanie komponentów w określone miejsca UI (sloty i subsloty),
- modyfikację struktury layoutu bez edycji core aplikacji,
- reagowanie na kontekst strony (np. typ widoku, konteksty trasy).

### Interceptory

Interceptory są mechanizmem integracyjnym pomiędzy modułami a layoutem.

Charakterystyka:
- są ładowane **kontekstowo** (np. `default`, `category`, `product`),
- są rejestrowane na etapie bootstrapu SSR/CSR,
- służą do rejestracji komponentów, modyfikacji layoutu oraz konfiguracji zachowania UI,
- **nie powinny zawierać ciężkiej logiki biznesowej**.

Mechanizm interceptorów oraz sposób ich rejestracji **pozostaje niezmieniony** – zmieniło się wyłącznie miejsce implementacji systemu layoutów (przeniesione do `framework/layout`).

---

## Routing, handlery i `routeMeta`

Każdy moduł może dostarczać:
- `routes.ts` (statyczna definicja trasy: `path`, `contexts`, `meta`, `layout`),
- opcjonalny `routeHandler` (`route.handler`) uruchamiany na serwerze, który może doprecyzować:
  - `contexts` (np. po rozpoznaniu typu strony),
  - `routeMeta` (meta-dane strony przekazywane do layoutu i do `/api/page-context`).

### Jak wybieramy „aktywną” trasę?

- Renderowanie SSR/CSR używa React Router (ranking ścieżek), więc **bardziej specyficzne ścieżki zawsze wygrywają** nad mniej specyficznymi (np. `/wishlist` wygrywa z `/*`).
- `priority` z `routes.ts` jest używane do:
  - deterministycznego scalania/porządkowania tras z modułów,
  - rozstrzygania remisów (np. dwa moduły definiują ten sam `path` – wtedy wygrywa wyższy `priority`, bo trasa jest wcześniej w tablicy).
- Zasada praktyczna: catch-all (`/*`) powinien mieć **niski** `priority`, żeby nie “zasłaniał” tras aplikacji.

`routeMeta` jest kontraktem pomiędzy routingiem a modułami UI/layoutu (opis w `docs/page-context.md`). Przykłady użycia:
- `type='redirect'` → SSR/CSR wykonuje redirect bez budowania layoutu,
- `type='not-found'` → SSR zwraca `404` i ładuje kontekst `not-found`,
- `type='category'|'product'|'cms'|'search'` → dobór interceptorów i layoutu + ewentualny SSR prefetch danych.

W Renii ważne jest to, że handler może być jedynym „resolverem” dynamicznych URL-i (np. Magento `urlResolver` w module `renia-magento-routing` dla ścieżek `/*`), a moduły stron (PDP/PLP/CMS) są wstrzykiwane interceptorami na podstawie `contexts`.

### Prefetch `/api/page-context` (szybkie przejścia)

Prefetch PageContext jest **opcjonalną** optymalizacją (spekulatywny request na hover/focus). Domyślnie jest **wyłączony** i powinien być włączany tylko po pomiarach (żeby nie generować zbędnych requestów do `/api/page-context` i integracji).

Jeśli świadomie włączasz prefetch:
- komponent: `@renia/framework/router/PrefetchLink` + ustaw `prefetch={true}`
- cache: klientowy in-memory TTL + coalescing requestów (żeby nie spamować `/api/page-context`)

Efekt: przejścia SPA mają mniejszą liczbę requestów i zachowują się podobnie do SSR (dane routeMeta/contexts są gotowe w momencie nawigacji).

## Zasady zależności między modułami

Obowiązujące reguły:

- moduły UI → mogą zależeć od domenowych,
- moduły domenowe → mogą zależeć od integracyjnych i kontekstu,
- moduły integracyjne → mogą zależeć tylko od infrastruktury,
- moduły infrastrukturalne → nie zależą od nikogo.

Zabronione:
- import backend clienta bezpośrednio w UI,
- własne implementacje cache w modułach domenowych,
- omijanie standardu kontekstu i klucza cache.

---

## Struktura przykładowego modułu

```
modules/<moduł>/
├── package.json          # nazwa pakietu
├── registration.ts       # metadata modułu i zależności
├── registerComponents.ts # rejestracja komponentów
├── routes.ts             # (opcjonalnie) dodatkowe trasy
├── interceptors/         # (opcjonalnie) interceptory layoutu
├── services/             # logika aplikacyjna
├── components/           # komponenty UI
└── README.md             # dokumentacja modułu
```

---

## Dlaczego ta architektura

- umożliwia budowę wielu wariantów aplikacji z jednego codebase,
- ogranicza sprzężenia między funkcjonalnościami,
- ułatwia kontrolę cache, SSR i wydajności,
- jest przyjazna dla rozwoju przez wiele zespołów i agentów AI.
