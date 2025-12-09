# renia-router

Moduł odpowiedzialny za dynamiczne trasy rejestrowane przez inne moduły. Korzysta z `renia-module-registry`, aby brać pod uwagę statusy modułów (włączony/wyłączony) i ich zależności.

## Co robi
- Wczytuje aktywne moduły (z `modules` i opcjonalnie `node_modules`) przy pomocy `loadModuleRegistry`.
- Dla każdego aktywnego modułu szuka pliku tras (`routes.ts` lub `routes.js`, ewentualnie wskazany nazwą w opcjach) i odczytuje z niego definicje.
- Normalizuje i deduplikuje trasy, sortując je malejąco według `priority` (domyślnie `0`).
- Ignoruje moduły wyłączone lub z brakującymi zależnościami (zgodnie z rejestrem modułów).

## Kontrakt pliku tras
- Plik `routes.ts`/`routes.js` (w katalogu modułu) powinien eksportować domyślnie tablicę obiektów lub obiekt `{ routes: [...] }`.
- Każdy wpis może zawierać:  
  - `path` (wymagany, string),  
  - `component` (string – identyfikator komponentu, np. nazwa do dynamicznego importu),  
  - `redirect` (opcjonalnie string),  
  - `status` (opcjonalnie kod dla redirectu),  
  - `priority` (number, domyślnie 0; większa wartość = wyżej),  
  - `guards` (opcjonalnie string[]),  
  - `meta` (opcjonalnie dowolny obiekt).

## API
```ts
import { loadRoutesRegistry } from 'renia-router';

const routes = await loadRoutesRegistry({
  // routesFileName: 'routes.js', // opcjonalnie wymusza nazwę pliku tras
  // configPath: 'app/etc/config.json', // opcjonalnie ścieżka do statusów modułów
  // includeNodeModules: true, // domyślnie true
  // statusMap: { 'nazwa-modulu': 1 } // opcjonalne nadpisanie statusów w locie
});
// routes: Array<{ path, component?, redirect?, status?, priority?, guards?, meta?, module }>
```

## Rejestracja trasy w module
1. Upewnij się, że moduł jest wpisany jako włączony w `app/etc/config.json` (`modules.<nazwa> = 1` lub `true`), inaczej zostanie pominięty.
2. Dodaj w katalogu modułu plik `routes.ts` lub `routes.js` z tablicą tras.
3. Po wywołaniu `loadRoutesRegistry` trasy zostaną wczytane tylko dla modułów aktywnych i posortowane wg `priority`.
