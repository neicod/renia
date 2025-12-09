# renia-module-registry

Moduł odpowiada za wykrywanie i porządkowanie pakietów z katalogów `modules` oraz (opcjonalnie) `node_modules`, uwzględniając status włączenia oraz zależności (`dependencies` i `peerDependencies`). Zwraca listę modułów posortowaną topologicznie (aktywni na początku, wyłączeni na końcu).

## Co robi
- Skanuje katalog `modules` (oraz `node_modules`, jeśli `includeNodeModules` nie jest ustawione na `false`).
- Odczytuje `package.json` każdego pakietu (nazwa, zależności, peerDependencies).
- Status modułu:
  - domyślnie pochodzi z `app/etc/config.json` → sekcja `modules` (`1/true` = włączony, `0/false` = wyłączony),
  - można tymczasowo nadpisać w opcjach loadera (`statusMap`).
  - brak wpisu w configu oznacza: moduł wyłączony.
- Jeśli moduł zależy od pakietu wyłączonego lub nieistniejącego, jest wyłączany, a brakujące zależności są logowane.
- Wynik to lista `{ name, path, source, enabled, dependencies, missingDeps? }`, gdzie aktywne moduły są posortowane według zależności.

## Jak zarejestrować moduł
1. Umieść moduł w `modules/<nazwa>` z własnym `package.json` (pole `name` wymagane; uzupełnij `dependencies`/`peerDependencies`, jeśli są potrzebne).
2. Dodaj wpis w `app/etc/config.json` w sekcji `modules`, ustawiając `1` lub `true` dla danej nazwy:
   ```json
   {
     "modules": {
       "twoj-modul": 1
     }
   }
   ```
   Brak wpisu = moduł wyłączony.
3. (Opcjonalnie) w kodzie możesz nadpisać statusy w locie, przekazując `statusMap` do `loadModuleRegistry`, np. `{ "twoj-modul": 1 }`.
4. Wywołaj `loadModuleRegistry()` (import z `renia-module-registry`) – otrzymasz listę posortowaną topologicznie. Wyłączone moduły pojawią się na końcu z ewentualnym polem `missingDeps`.

## Przykład użycia
```ts
import { loadModuleRegistry } from 'renia-module-registry';

const modules = await loadModuleRegistry({
  // includeNodeModules: true, // domyślnie true
  // configPath: 'app/etc/config.json', // domyślna ścieżka
  // statusMap: { 'twoj-modul': 1 } // opcjonalne nadpisanie
});

modules.forEach((m) => {
  if (m.enabled) {
    console.log(`Aktywny: ${m.name} (${m.path})`);
  } else {
    console.log(`Wyłączony: ${m.name}`, m.missingDeps ? `- brak: ${m.missingDeps.join(', ')}` : '');
  }
});
```
