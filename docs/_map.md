# 🗺️ Mapa dokumentacji (ściągawka)

Ten plik jest **punktem startowym** dla każdego developera lub agenta pracującego z tym repozytorium.
Opisuje **za co odpowiada każdy plik w `docs/`** oraz **gdzie należy dopisywać nowe informacje**.

> Zasada nadrzędna: **jedna decyzja = jedno źródło prawdy**. Nie duplikujemy treści między plikami.

---

## Kolejność czytania (obowiązkowa)
1. `architecture.md`
2. `pricing-modes.md`
3. `rendering-matrix.md`
4. `cache-policy.md`
5. `data-boundaries.md`
6. `capabilities.md`
7. `app-config.md`
8. `page-context.md`
9. `implementation-guidelines.md`
10. `checklists.md`
11. `testing-observability.md`
12. `MODULES.md`
13. `best-practices.md`

---

## Pliki i ich odpowiedzialność

### `architecture.md`
**Odpowiada za:** wizję, cele i fundamenty architektury frontendu.

**Zawiera:**
- główne zasady (SSR shell + wyspy, rozdział base/pricing)
- model renderowania (SSR shell + wyspy)
- definicję zakresów danych (PUBLIC / SEGMENT / PRIVATE)
- non-goals projektu

**Nie zawiera:** kodu, przykładów implementacyjnych, checklist.

---

### `pricing-modes.md`
**Odpowiada za:** definicję i semantykę trybów cenowych.

**Zawiera:**
- `PUBLIC`, `GROUP_FEW`, `GROUP_MANY`, `ACCOUNT`
- próg `GROUP_FEW = max 5`
- definicję segmentu (co wchodzi do klucza cache)

**Nie zawiera:** decyzji renderingu per strona (to jest w `rendering-matrix.md`).

---

### `rendering-matrix.md`
**Odpowiada za:** decyzje *jak renderujemy* strony i fragmenty.

**Zawiera:**
- tabelę: shell vs cena/dostępność vs cache
- różnice PDP vs PLP vs CMS
- zasady batch pricing

**Zasada:** jeśli zmienia się sposób renderowania → aktualizuj TEN plik.

---

### `cache-policy.md`
**Odpowiada za:** zasady cache po stronie frontendu.

**Zawiera:**
- definicję PUBLIC / SEGMENT / PRIVATE
- standard budowania klucza cache (format i kolejność pól)
- TTL (w tym domyślne 10 min dla GROUP_FEW)
- dozwolone i zabronione wzorce

**Zasada:** jeśli coś NIE MOŻE trafić do cache → opis musi być tutaj.

---

### `data-boundaries.md`
**Odpowiada za:** kontrakty danych i granice odpowiedzialności.

**Zawiera:**
- rozdział `ProductBase` vs `ProductPricing` vs `ProductAvailability`
- zasady co może być PUBLIC/SEGMENT/PRIVATE
- zasady dla badge’y/promocji

**Zasada:** jeden kontrakt = jeden owner.

---

### `capabilities.md`
**Odpowiada za:** konfigurację tenantów i przełączniki zachowania.

**Zawiera:**
- listę capabilities (PRICING_MODE, STORE_MODE, I18N_MODE, itp.)
- zasady użycia (capabilities zamiast ifologii w UI)

**Nie zawiera:** logiki warunkowej ani kodu.

---

### `app-config.md`
**Odpowiada za:** kontrakt `AppConfig` (bootstrap) oraz RequestContext (SSR).

**Zawiera:**
- źródła `config` (SSR → bootstrap → CSR)
- zasady odczytu (`readAppConfig()`)
- namespace `config.integrations.*`

**Nie zawiera:** logiki biznesowej i integracyjnych detali spoza kontraktu.

---

### `page-context.md`
**Odpowiada za:** przepływ `PageContext` i endpoint `/api/page-context`.

**Zawiera:**
- model danych `PageContext`
- cykl SSR/CSR i momenty rewalidacji
- kontrakt augmentera i endpointu
- kontrakt `routeMeta` (w tym `redirect` / `not-found`) wykorzystywany przez SSR i klienta

**Zasada:** każda zmiana w API kontekstu musi być odnotowana w tym pliku.

---

### `implementation-guidelines.md`
**Odpowiada za:** *jak to implementujemy* w kodzie.

**Zawiera:**
- standardy jakości (SOLID)
- wzorce DAL (fetch, scope, cache key builder)
- wzorce komponentów (shell vs islands)
- antywzorce

**To jedyny plik, gdzie opisujemy HOW.**

---

### `checklists.md`
**Odpowiada za:** kontrolę jakości i regresji architektury.

**Zawiera:**
- checklisty PR
- checklisty wydajności
- checklisty architektoniczne

---

### `testing-observability.md`
**Odpowiada za:** testy, invarianty oraz narzędzia debug/diagnostyki.

**Zawiera:**
- jak uruchamiać testy,
- tryb `SSR_DEBUG=1` i endpointy debug (`/api/debug/*`),
- flagi logowania/telemetrii.

---

### `MODULES.md`
**Odpowiada za:** architekturę modułową platformy.

**Zawiera:**
- role techniczne modułów (infrastruktura / integracja / kontekst+cache / domena / UI)
- zasady zależności między modułami
- system layoutów i slotów (w `framework/layout`) oraz interceptory

---

### `best-practices.md`
**Odpowiada za:** dodatkowe praktyki utrzymania platformy.

**Zawiera:**
- ADR-y (log decyzji)
- zasady granic modułów
- obserwowalność, budżety wydajności
- panic switch dla cache

---

## Zasady aktualizacji dokumentacji

- Zmieniasz tryb cenowy / segment → `pricing-modes.md` (+ ewent. `rendering-matrix.md`)
- Zmieniasz sposób renderowania → `rendering-matrix.md`
- Zmieniasz klucz cache / TTL / scope → `cache-policy.md` (+ ewent. `implementation-guidelines.md`)
- Dodajesz nowy kontrakt danych → `data-boundaries.md`
- Dodajesz flagę konfiguracyjną → `capabilities.md`
- Zmieniasz wzorce kodu → `implementation-guidelines.md`
- Zmieniasz zasady modułów → `MODULES.md`
- Dodajesz/zmieniasz artefakty generowane (katalog `generated/`) → `AGENT_INSTRUCTIONS.md`
- Dodajesz praktyki organizacyjne → `best-practices.md`

---

## Szybka reguła decyzyjna
Jeśli nie wiesz, gdzie coś dopisać:
- **zasada / filozofia** → `architecture.md`
- **tryby cenowe / segmentacja** → `pricing-modes.md`
- **rendering (SSR shell / PDP/PLP)** → `rendering-matrix.md`
- **cache (klucze/TTL/scope)** → `cache-policy.md`
- **dane / kontrakty** → `data-boundaries.md`
- **konfiguracja klienta (flags)** → `capabilities.md`
- **implementacja / HOW** → `implementation-guidelines.md`
- **kontrola jakości** → `checklists.md`
- **architektura modułów** → `MODULES.md`
- **praktyki dodatkowe** → `best-practices.md`

> Jeśli po przeczytaniu tej mapy nadal masz wątpliwości — nie zgaduj. Dokumentacja jest częścią architektury.
