# Koncepcja: renia-i18n

Cel: jednolity system tłumaczeń dla SSR i klienta, z kluczami semantycznymi i interpolacją nazwanych oraz pozycyjnych placeholderów. Priorytet: `app/i18n` > aktywne moduły `*/i18n` > fallback `en_US`.

Składniki:
- `I18nProvider` + `useI18n()` – kontekst z `t(key, params?)`, `lang`, `setLang`.
- `interpolate` – obsługa `:name` (nazwane) i `%1` (pozycyjne), escapowanie `\\:` i `%%`.
- `I18nBootstrap` – wstrzykiwany przez interceptor do `global-overlay`, zapewnia kontekst w całej aplikacji.
- `services/loader.ts` (TODO) – ładowanie/mergowanie paczek językowych (moduły + app override), cache w pamięci.

Pliki tłumaczeń:
- Moduły: `app/modules/<vendor>/<module>/i18n/<lang>.json`.
- Override: `app/i18n/<lang>.json` (nadpisuje klucze modułów).
- Format JSON płaski, klucze z kropką: `"cart.empty": "Koszyk jest pusty"`.

Placeholdery:
- Nazwane: `t('cart.total', { amount: '99 PLN' })` gdy `cart.total = "Suma: :amount"`.
- Pozycyjne: `t('cart.updated', ['2'])` gdy `cart.updated = "Zmieniono ilość na %1"`.

Build (plan):
- `npm run build:i18n` – zebrać wszystkie pliki `i18n` aktywnych modułów + `app/i18n`, zmergować per język do `dist/i18n/<lang>.json`, podać do SSR jako `initialTranslations`.

Fallback:
- Brak klucza w języku → szukaj w `en_US` → w dev log ostrzeżenie, zwróć klucz.
