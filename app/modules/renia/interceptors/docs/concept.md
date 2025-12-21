# Koncepcja: renia-interceptors

Cel: uruchamianie interceptorów z modułów. Interceptor to modułowy plik wykonywany dla efektów ubocznych (np. dopięcie do regionów layoutu albo rozszerzenie komponentu), bez wymuszonego formatu danych.

Założenia:
- Pliki w `interceptors/`: `default.(ts|js)` (globalnie) oraz `<kontekst>.(ts|js)` (np. `control-menu`).
- Loader uruchamia interceptory tylko z aktywnych modułów (wg `config.json` i rejestracji).
- Eksport domyślny może być funkcją `(api, context) => void|Promise`; jeśli nie jest funkcją, sam import wykona logikę modułu.
- Kolejność: najpierw `default`, potem pliki dla zadanego kontekstu; brak priorytetów między modułami (deterministyczne wejście po kolejności modułów).
- API layoutu: typowo `api.layout.get('<region>').add(componentPath|component, id, options)`.
- API rozszerzeń komponentów: `api.extend.component('<host>').outlet('<name>').add(componentPath, id, options)`.

Konwencje:
- Interceptory służą do wpływania na inne moduły (np. dopięcie do regionów layoutu albo rozszerzenie komponentu) bez twardej zależności; moduły mają mieć zależności zadeklarowane w `registration.js` tylko gdy jest to wymagane.
- Błąd w interceptorze nie powinien zatrzymać reszty — logowanie/obsługa błędów po stronie loadera.
