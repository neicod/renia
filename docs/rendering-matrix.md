

# Rendering Matrix

| Pricing Mode | Page Shell | Pricing Block | Cache Scope |
|-------------|-----------|---------------|-------------|
| PUBLIC | ISR | Included in shell | CDN / ISR |
| GROUP_FEW | ISR | SSR (cached per group) | Redis / Next cache |
| GROUP_MANY | ISR | SSR private | None / session |
| ACCOUNT | ISR | SSR private | None |

## Notes
- Page shell is always ISR by default
- Only pricing-related fragments change behavior
- SEO-critical pages may opt-in to server-rendered pricing selectively
# Matryca renderowania

| Tryb cenowy | Page Shell | Blok ceny | Zakres cache |
|------------|------------|-----------|--------------|
| PUBLIC | ISR | W shellu | CDN / ISR |
| GROUP_FEW | ISR | SSR (cache per grupa) | Redis / Next cache |
| GROUP_MANY | ISR | SSR prywatny | Brak / sesja |
| ACCOUNT | ISR | SSR prywatny | Brak |

## Uwagi
- Page shell domyślnie zawsze ISR
- Zmienny jest wyłącznie sposób renderowania ceny
- Strony SEO‑krytyczne mogą opcjonalnie renderować cenę po stronie serwera
# Matryca renderowania

> Skróty:
> - **PDP** (Product Detail Page) – karta produktu
> - **PLP** (Product Listing Page) – lista produktów / kategoria
> - **CMS** – strony treściowe (np. „O nas”, landing)

## Domyślna zasada
- **Shell strony (content/base) renderujemy jako ISR**.
- Zmienny jest głównie sposób renderowania **ceny / dostępności**.

## Matryca (wysokopoziomowa)

| Tryb cenowy | Page Shell (PDP/PLP) | Cena / dostępność | Zakres cache |
|------------|-----------------------|-------------------|--------------|
| PUBLIC | ISR | W shellu | CDN / ISR |
| GROUP_FEW | ISR | SSR (cache per grupa) | SEGMENT (Redis / Next cache) |
| GROUP_MANY | ISR | SSR prywatny | PRIVATE (brak public cache / ewent. sesja) |
| ACCOUNT | ISR | SSR prywatny | PRIVATE |

## Ważna uwaga o PLP
PLP ma dużo pozycji, więc cena jest kosztowna.
- W `GROUP_FEW` preferujemy **jeden request** po ceny dla listy (batch) + cache per grupa.
- W `GROUP_MANY` / `ACCOUNT` preferujemy:
  - ceny jako prywatny fragment (SSR) albo
  - „placeholder” w liście i doładowanie po stronie serwera (bez mnożenia requestów per produkt).

## CMS
CMS prawie zawsze: **PUBLIC + ISR**.