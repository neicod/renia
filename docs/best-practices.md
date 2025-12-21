

# Best practices

Ten dokument zbiera dodatkowe praktyki, które pomagają utrzymać **platformę** (wiele wariantów klientów) w dobrej kondycji.
To jest uzupełnienie dla:
- `docs/architecture.md`
- `docs/cache-policy.md`
- `docs/implementation-guidelines.md`

> Zasada: jeśli praktyka wpływa na cache/rendering/kontrakty danych – aktualizujemy też odpowiedni dokument kanoniczny.

---

## 1) ADR – log decyzji architektonicznych
Rekomendujemy prowadzenie krótkich wpisów ADR dla decyzji, które:
- zmieniają architekturę,
- wpływają na cache/klucze/TTL,
- wpływają na sposób renderowania.

Minimalny format ADR:
- kontekst (problem)
- decyzja
- konsekwencje
- alternatywy (1–2)

---

## 2) Granice modułów i kontrakty
- Moduły eksportują **publiczne API** przez `index.ts`.
- Zabronione są importy z wnętrza modułu (np. `module/src/...`).
- UI nie importuje klienta backendu – UI zależy od kontraktów/domeny.

Cel: łatwiejsze refaktory i brak „przecieków” zależności.

---

## 3) Jedno miejsce budowy kontekstu requestów
W całej aplikacji powinno istnieć jedno źródło prawdy dla:
- `storeCode`
- `currency`
- `locale`
- `groupId` (jeśli dotyczy)

Nie rozpraszamy logiki kontekstu po komponentach.

---

## 4) Fetch z jawnym scope (public/segment/private)
Każdy fetch musi deklarować scope:
- `public`
- `segment`
- `private`

Rekomendacja: wprowadzić helper/wrapper, który wymusza scope i buduje cache key zgodnie z `docs/cache-policy.md`.

---

## 5) PLP: zakaz N+1 requestów
Na listach (PLP) obowiązuje zasada:
- nie pobieramy cen/dostępności per produkt osobnymi requestami,
- preferujemy **batch pricing** (jeden request na listę/paginację/sort).

To jest najczęstszy killer wydajności.

---

## 6) „Panic switch” dla cache
Cache musi dać się szybko wyłączyć bez zmian w kodzie:
- globalnie,
- per scope,
- per obszar (np. pricing).

Przykład podejścia:
- TTL=0 (wyłącza)
- `no-store` dla private

---

## 7) Budżety wydajności
Warto wprowadzić proste budżety (egzekwowane w review lub testach):
- maksymalna liczba requestów serwerowych na widok
- maksymalny rozmiar payloadu dla PLP
- limit czasu dla krytycznych endpointów

---

## 8) Testy regresji cache
Minimum:
- testy generacji cache key (snapshoty dla różnych kontekstów)
- testy „PUBLIC nie ma groupId”, „GROUP_FEW ma groupId”
- E2E scenariusze dla `PUBLIC` i `GROUP_FEW` na PDP + PLP

---

## 9) Obserwowalność
Rekomendacje:
- logowanie hit/miss cache (dev i sampling w prod)
- correlation id dla requestów (frontend → backend)
- metryki TTFB i czas renderowania serwera

---

## 10) Konsekwentne formatowanie i review
- Trzymamy się SOLID (patrz `docs/implementation-guidelines.md`).
- Każda zmiana wpływająca na cache/rendering wymaga aktualizacji dokumentów.
- Checklisty z `docs/checklists.md` są obowiązkowe w PR.