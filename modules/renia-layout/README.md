# renia-layout

Moduł do zarządzania układem strony poprzez sloty. Zbiera definicje slotów z plików `layout.ts` / `layout.js` / `layout.json` w aktywnych modułach i buduje rejestr slotów posortowany według `priority`.

## Co robi
- Korzysta z `renia-module-registry`, aby uwzględniać tylko aktywne moduły (statusy z `app/etc/config.json` albo nadpisane w `statusMap`).
- Szuka w każdym aktywnym module pliku `layout.ts`/`layout.js`/`layout.json` (lub nazwy podanej w opcjach) i wczytuje definicje slotów.
- Normalizuje i deduplikuje wpisy (komponent + slot + priority); sortuje malejąco po `priority`.
- Zwraca rejestr w formie:
  ```ts
  {
    slots: Record<string, SlotEntry[]>;
    flat: SlotEntry[];
  }
  ```
  gdzie `slots` to pogrupowane wpisy dla danego slotu (posortowane), a `flat` to lista wszystkich wpisów.

## Wbudowane layouty
- `layouts/1column` — baza z gniazdami m.in. `control-menu` i `main` (do rozszerzania przez moduły).

## Kontrakt pliku layoutu
- Plik powinien eksportować domyślnie tablicę lub obiekt `{ slots: [...] }`.
- Każdy wpis:
  - `slot` (wymagany, string),
  - `component` (wymagany, string – identyfikator komponentu, np. do resolvera/lazy importu),
  - `priority` (opcjonalny number, domyślnie 0; większa wartość = wyżej),
  - `props` (opcjonalny obiekt z danymi dla komponentu),
  - `meta` (opcjonalne dodatkowe metadane).

## API
```ts
import { loadLayoutRegistry } from 'renia-layout';

const layout = await loadLayoutRegistry({
  // layoutFileName: 'layout.ts', // opcjonalnie wymuszona nazwa pliku
  // configPath: 'app/etc/config.json', // opcjonalnie inna ścieżka do statusów modułów
  // includeNodeModules: true, // domyślnie true
  // statusMap: { 'nazwa-modulu': 1 } // opcjonalne nadpisanie statusu
});

const headerSlots = layout.slots['header'] ?? [];
```

## Jak wpiąć komponent do layoutu
1. Upewnij się, że moduł jest włączony w `app/etc/config.json` (`modules.<nazwa> = 1` lub `true`); brak wpisu oznacza wyłączenie.
2. Dodaj w module plik `layout.ts` / `layout.js` / `layout.json` i wyeksportuj tablicę slotów, np.:
   ```ts
   export default [
     { slot: 'control-menu', component: 'CartMenuItem', priority: 90 }
   ];
   ```
3. Wywołaj `loadLayoutRegistry()`, aby uzyskać posortowane sloty (tylko z aktywnych modułów). Warstwa renderująca odpowiada za mapowanie `component` na realny komponent React.
