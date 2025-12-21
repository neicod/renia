

# Matryca renderowania

## Słowniczek
- **PDP** (Product Detail Page) – karta produktu (strona szczegółów produktu)
- **PLP** (Product Listing Page) – lista produktów (kategoria/wyszukiwarka)
- **CMS** – strony treściowe (np. „O nas”, landing)

## Domyślna zasada
- **Shell strony (content/base) renderujemy jako ISR**.
- Zmienny jest głównie sposób renderowania **ceny / dostępności / badge’y promocyjne**.

## Matryca (wysokopoziomowa)

| Tryb cenowy | Shell (PDP/PLP) | Cena / dostępność | Zakres cache |
|------------|------------------|-------------------|--------------|
| PUBLIC | ISR | w shellu | PUBLIC (CDN/ISR) |
| GROUP_FEW | ISR | SSR + cache per `groupId` | SEGMENT |
| GROUP_MANY | ISR | SSR prywatny | PRIVATE |
| ACCOUNT | ISR | SSR prywatny | PRIVATE |

## Ważne różnice PDP vs PLP

### PDP (karta produktu)
- Ma mało danych dynamicznych na raz → łatwo zrobić „wyspę ceny”.
- W `GROUP_FEW` cena/dostępność mogą być SSR + cache per grupa.

### PLP (lista produktów)
- Ma dużo pozycji → najłatwiej zabić wydajność, jeśli pobierasz cenę „per produkt”.

Zasady:
- `GROUP_FEW`: preferuj **batch pricing** (jeden request po ceny dla listy) + cache per grupa.
- `GROUP_MANY/ACCOUNT`: preferuj prywatny fragment dla całej listy (jeden request), albo placeholdery bez mnożenia requestów.

## CMS
CMS prawie zawsze: **PUBLIC + ISR**.
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
# Matryca renderowania

## Słowniczek
- **PDP** (Product Detail Page) – karta produktu (strona szczegółów produktu)
- **PLP** (Product Listing Page) – lista produktów (kategoria/wyszukiwarka)
- **CMS** – strony treściowe (np. „O nas”, landing)

## Domyślna zasada
- **Shell strony (content/base) renderujemy jako ISR**.
- Zmienny jest głównie sposób renderowania **ceny / dostępności / badge’y promocyjne**.

## Matryca (wysokopoziomowa)

| Tryb cenowy | Shell (PDP/PLP) | Cena / dostępność | Zakres cache |
|------------|------------------|-------------------|--------------|
| PUBLIC | ISR | w shellu | PUBLIC (CDN/ISR) |
| GROUP_FEW | ISR | SSR + cache per `groupId` | SEGMENT |
| GROUP_MANY | ISR | SSR prywatny | PRIVATE |
| ACCOUNT | ISR | SSR prywatny | PRIVATE |

## Ważne różnice PDP vs PLP

### PDP (karta produktu)
- Ma mało danych dynamicznych na raz → łatwo zrobić „wyspę ceny”.
- W `GROUP_FEW` cena/dostępność mogą być SSR + cache per grupa.

### PLP (lista produktów)
- Ma dużo pozycji → najłatwiej zabić wydajność, jeśli pobierasz cenę „per produkt”.

Zasady:
- `GROUP_FEW`: preferuj **batch pricing** (jeden request po ceny dla listy) + cache per grupa.
- `GROUP_MANY/ACCOUNT`: preferuj prywatny fragment dla całej listy (jeden request), albo placeholdery bez mnożenia requestów.

## CMS
CMS prawie zawsze: **PUBLIC + ISR**.