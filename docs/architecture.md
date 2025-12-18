

# Architecture

## Goal
Build a reusable, high-performance Next.js (App Router) frontend base for headless Magento projects (B2C and B2B), adaptable to different pricing, store, and personalization models.

Magento is treated as a data provider. All rendering, caching, and personalization strategies are implemented on the frontend.

## Core Principles
- Default to static or incremental rendering (ISR)
- Separate content (base) from personalization (pricing, availability)
- Cache aggressively where cardinality is low
- Avoid SSR unless it provides measurable value
- Never mix authenticated context into public cache

## High-Level Model

### Page Shell
- Rendered using ISR
- Contains only public, non-personalized data
- Cacheable at CDN level

### Private / Segment Islands
- Price, stock, promotions, permissions
- Rendered using SSR or server-side fetches
- Cache scope depends on pricing mode

## Data Scopes
- PUBLIC: same for all users
- SEGMENT: varies by store, locale, currency, or customer group
- PRIVATE: varies per customer or company

## Non-Goals
- Full SSR for the entire catalog
- Frontend business logic duplication of Magento
- Cache strategies depending on user tokens
# Architektura

## Cel
Zbudowanie wielokrotnego użytku, wysokowydajnej bazy frontendowej w Next.js (App Router) dla projektów headless Magento (B2C i B2B), możliwej do dostosowania do różnych modeli cenowych, store’ów i personalizacji.

Magento jest traktowane wyłącznie jako dostawca danych. Cała logika renderowania, cache i personalizacji znajduje się po stronie frontendu.

## Główne zasady
- Domyślnie używamy renderowania statycznego lub przyrostowego (ISR)
- Rozdzielamy content (base) od personalizacji (ceny, dostępność)
- Cache’ujemy agresywnie tam, gdzie kardynalność jest niska
- Unikamy SSR, jeśli nie daje mierzalnej wartości
- Nigdy nie mieszamy kontekstu uwierzytelnienia z publicznym cache

## Model wysokopoziomowy

### Page Shell
- Renderowany jako ISR
- Zawiera wyłącznie publiczne, niespersonalizowane dane
- Może być cache’owany na poziomie CDN

### Wyspy prywatne / segmentowe
- Cena, stock, promocje, uprawnienia
- Renderowane przez SSR lub server-side fetch
- Zakres cache zależy od trybu cenowego

## Zakresy danych
- PUBLIC: identyczne dla wszystkich użytkowników
- SEGMENT: zależne od store, locale, waluty lub customer group
- PRIVATE: zależne od konkretnego klienta lub firmy

## Poza zakresem
- Full SSR dla całego katalogu
- Duplikowanie logiki biznesowej Magento na froncie
- Strategie cache zależne od tokenów użytkownika