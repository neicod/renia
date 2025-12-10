# Koncepcja: renia-module-registry

Cel: rejestr modułów (z `modules`/`node_modules`), uwzględnia statusy z `app/etc/config.json`, rejestracje (`registration.*`) i zależności między modułami.

Główne założenia:
- Moduł aktywny tylko przy wpisie w `config.json` (1/true) i poprawnej walidacji zależności.
- Walidacja zależności dotyczy wyłącznie modułów z plikiem `registration.*`; zależności z `registration.dependencies` wskazują inne moduły (nie biblioteki npm).
- Brak modułu-dependencji → moduł wyłączony (flagowane w rejestrze).
- Rejestr zwraca listę `{ name, path, enabled, dependencies, hasRegistration, registrationPath, missingDeps? }`, posortowaną topologicznie (enabled) + disabled na końcu.

Konwencje:
- Plik `registration.{ts,js,json}`: `name`, `version`, `type`, `dependencies: string[]`.
- Statusy w `app/etc/config.json`; brak wpisu = off.
- Nie ingeruje w zewnętrzne paczki npm; weryfikuje jedynie zależności modułowe.
