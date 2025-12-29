# Capabilities

Capabilities to flagi konfiguracyjne definiujące zachowanie tenantów.

> **Status implementacji (grudzień 2025):** realna obsługa capabilities w runtime (centralny odczyt + egzekwowanie w kodzie) jest **dopiero w planach**. Na dziś traktuj ten dokument jako opis architektury docelowej i listę planowanych przełączników tenantów.

## Główne capabilities

### PRICING_MODE
- PUBLIC
- GROUP_FEW
- GROUP_MANY
- ACCOUNT

### STORE_MODE
- single
- multi

### I18N_MODE
- domain
- path
- off

### CATALOG_RENDERING_MODE
- ssr (SSR pierwszego wejścia + CSR nawigacja)
- csr_only (brak SSR; tryb developerski/testowy)

## Zasady
- Capabilities nie zmieniają API komponentów
- Wpływają wyłącznie na data fetching i cache
