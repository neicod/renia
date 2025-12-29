<file name=docs/best-practices.md># Best Practices

## 10) Konsekwentne formatowanie i review

---

## 11) Dodatkowe zasady projektowe

Poza **SOLID** i **DRY** w tym projekcie świadomie stosujemy:

- **KISS** – preferujemy najprostsze rozwiązanie, szczególnie w cache, renderingu i routingach.
- **YAGNI** – nie budujemy abstrakcji ani hooków „na przyszłość” bez realnego use-case.
- **Separation of Concerns** – UI ≠ domena ≠ integracja ≠ infrastruktura.
- **Clean Architecture / Dependency Rule** – zależności idą do środka (UI → domena → integracja → infra).
- **Explicit over implicit** – jawne kontrakty, jawny scope fetchy, jawne capabilities.
- **Composition over inheritance** – rozszerzamy przez moduły, sloty i strategie.
- **Fail fast** – błędy konfiguracji (capabilities, context) wykrywamy jak najwcześniej.
- **Determinism** – ten sam input (context + query) musi dawać ten sam wynik i cache key.

Te zasady są traktowane jako **architektoniczne guardrails** dla całej platformy.
</file>

<file name=docs/checklists.md># Checklisty

## Checklist PR
- [ ] Brak danych prywatnych w PUBLIC shellu
- [ ] Poprawnie zastosowany tryb cenowy
- [ ] Jawnie określony zakres cache
- [ ] Brak tokenów auth w cache fetch
- [ ] Zmiana jest zgodna z SOLID (w szczególności SRP i Dependency Inversion)

## Checklist wydajności
- [ ] PUBLIC shell SSR cachowany na CDN tam, gdzie możliwe
- [ ] Cena/dostępność odseparowane od contentu
- [ ] PLP nie pobiera ceny „per produkt” (jest batch / jeden request)
- [ ] Zminimalizowany payload GraphQL

## Checklist architektury
- [ ] Zachowane granice danych (base vs pricing/availability)
- [ ] Capabilities zamiast warunków w kodzie
- [ ] Zachowana zasada KISS (brak zbędnej abstrakcji)
- [ ] Brak logiki „na przyszłość” (YAGNI)
- [ ] Zachowana separacja odpowiedzialności (UI / domena / integracja / infra)
- [ ] Zależności zgodne z Dependency Rule (brak zależności „do góry”)
</file>
