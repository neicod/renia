# Koncepcja: renia-menu

Cel: wspólny kontrakt dla struktur menu używanych w modułach (np. kategorie Magento). Definiuje typy/klasy do reprezentacji pozycji menu i operacji na drzewie.

Zakres:
- Typ `MenuItem`: `id`, `label`, `url`, opcjonalnie `children`, `position`, `includeInMenu`, `meta`.
- Pole `type` do klasyfikacji elementu (np. `category`, `cms`, `custom`); wartości rozszerzalne.
- Klasa `MenuTree`: przechowuje tablicę root, umożliwia sortowanie (po `position` lub alfabetycznie) i flatten.

Przeznaczenie:
- Moduły (np. `renia-magento-category`) mapują własne źródła danych (GraphQL) na `MenuItem[]`.
- Konsumenci slotów/menu korzystają z jednolitego kontraktu (renderowanie, sortowanie, filtrowanie).

Konwencje:
- `position` służy do deterministycznego sortowania; fallback: alfabetycznie po `label`.
- `includeInMenu` do filtrowania (true domyślne, brak = traktuj jako true).
- `meta` na dodatkowe informacje, które nie wpływają na kontrakt główny.
