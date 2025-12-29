# Renia Storefront – Platform Frontend

Ten plik jest **punktem startowym (onboarding)** dla developerów i agentów AI pracujących z tym repozytorium.

README **nie opisuje szczegółów domenowych ani implementacyjnych** (np. produktów, koszyka, checkoutu). Jego rolą jest:
- wyjaśnić *jakiego typu system to jest*,
- wskazać *gdzie znajduje się źródło prawdy*,
- ustalić *kolejność zapoznawania się z dokumentacją*.

---

## Czym jest ten projekt

Jest to **modułowa platforma frontendowa** oparta o **React + Express SSR**, zaprojektowana jako baza pod wiele wariantów aplikacji (różni klienci, różne modele cenowe, różne konfiguracje store’ów).

Backend (np. Magento) jest traktowany wyłącznie jako **dostawca danych**. Cała logika dotycząca:
- renderowania (SSR shell + wyspy),
- cache (PUBLIC / SEGMENT / PRIVATE),
- segmentacji (store, currency, locale, group),
- składania UI z modułów

znajduje się **po stronie frontendu**.

---

## Najważniejsze założenia architektoniczne (TL;DR)

- Domyślnie renderujemy **SSR shell** (content/base) i pozwalamy CDN/Varnish go cache’ować.
- Dane kontekstowe (ceny, dostępność, uprawnienia) są renderowane jako **wyspy segmentowe lub prywatne**.
- Cache jest agresywny tam, gdzie kardynalność jest niska.
- Nigdy nie opieramy cache na tokenach użytkownika.
- Architektura jest **modułowa i konfigurowalna**, a nie monolityczna.

Szczegóły tych zasad **nie są powielane w README** – znajdują się w plikach poniżej.

---

## Źródła prawdy (obowiązkowe do przeczytania)

Poniższe pliki stanowią **kanoniczną dokumentację architektury**. README jedynie do nich odsyła.

### 1. `docs/_map.md`
**Najważniejszy plik na start.**

Opisuje:
- za co odpowiada każdy dokument,
- gdzie dopisywać nowe decyzje,
- jak nie duplikować wiedzy.

> Jeśli nie wiesz, gdzie coś opisać – zacznij od `_map.md`.

---

### 2. `docs/architecture.md`
**Wizja i fundamenty architektury.**

- model renderowania (SSR shell + wyspy),
- zakresy danych (PUBLIC / SEGMENT / PRIVATE),
- założenia i non-goals.

Czytaj, aby zrozumieć *dlaczego* system jest zbudowany w ten sposób.

---

### 3. `docs/pricing-modes.md`
**Definicja trybów cenowych i segmentacji.**

- `PUBLIC`, `GROUP_FEW`, `GROUP_MANY`, `ACCOUNT`,
- próg `GROUP_FEW = max 5`,
- co wchodzi do segmentu (storeCode, currency, locale, groupId).

Ten plik determinuje zachowanie cache i renderowania cen.

---

### 4. `docs/rendering-matrix.md`
**Jak renderujemy strony i fragmenty UI.**

- różnice PDP / PLP / CMS,
- jakie fragmenty są PUBLIC vs SEGMENT/PRIVATE i jak je renderujemy,
- gdzie obowiązuje batch pricing.

Czytaj przed wprowadzaniem zmian w renderowaniu stron.

---

### 5. `docs/cache-policy.md`
**Jedyny dokument definiujący cache.**

- standard klucza cache (kolejność i format),
- TTL (w tym domyślne 10 min dla GROUP_FEW),
- co jest zabronione.

Jeśli coś trafia do cache – zasady muszą być tu opisane.

---

### 6. `docs/data-boundaries.md`
**Granice danych i kontrakty.**

- rozdział base vs pricing vs availability,
- zasady, co może być PUBLIC, a co nie,
- wyjątki typu „od ceny”.

Chroni architekturę przed skażeniem cache.

---

### 7. `docs/MODULES.md`
**Architektura modułowa platformy.**

- role techniczne modułów,
- zasady zależności,
- system slotów i interceptorów.

Czytaj, jeśli tworzysz nowy moduł lub zmieniasz istniejący.

---

### 8. `docs/implementation-guidelines.md`
**Jak implementujemy powyższe zasady w kodzie.**

- warstwa DAL,
- wzorce komponentów,
- antywzorce.

To jedyne miejsce, gdzie opisujemy *HOW*.

---

### 9. `docs/checklists.md`
**Kontrola jakości i regresji.**

- checklisty PR,
- checklisty wydajności,
- checklisty architektoniczne.

---

## Dla agentów AI

Ten projekt jest zaprojektowany tak, aby agenci AI:
- mieli jednoznaczne źródła prawdy,
- nie musieli zgadywać decyzji architektonicznych,
- mogli bezpiecznie proponować zmiany.

**Minimalny kontekst dla agenta:**
1. `_map.md`
2. `architecture.md`
3. `cache-policy.md`
4. `pricing-modes.md`
5. `MODULES.md`

Bez tego kontekstu nie należy proponować zmian w kodzie.

---

## Ważna uwaga

Jeśli dokumentacja i kod są ze sobą sprzeczne:
- **dokumentacja wygrywa**,
- albo dokumentację należy zaktualizować w ramach tego samego PR.

Dokumentacja jest częścią architektury, a nie dodatkiem.
