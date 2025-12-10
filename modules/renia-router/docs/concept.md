# Koncepcja: renia-router

Cel: dynamiczny rejestr tras z modułów. Wczytuje `routes.ts/.js` z aktywnych modułów, normalizuje, deduplikuje i sortuje po `priority`. Dostarcza dane do SSR/klienta.

Założenia:
- Trasa: `path`, `componentPath` (preferowane, serializowalne), opcjonalnie `component`, `priority`, `meta` (np. `layout`), `redirect`, `guards`.
- Moduł musi być aktywny (`config.json`) i przejść walidację zależności z `registration`.
- Deduplikacja: klucz `path + priority`; kolizje logowane, pierwszy wpis wygrywa.
- Wynik: lista `{ path, componentPath?, component?, meta?, priority?, module }` posortowana malejąco po `priority`.

Konwencje:
- `routes.ts/.js` eksportuje tablicę (lub `{ routes: [...] }`).
- Używaj `componentPath` zamiast eksportów funkcji (serializowalność).
- `layout` w meta decyduje o układzie (np. `1column`, `2column-left`) po stronie layoutu.*** End Patch*** End Patch to=functions.apply_patch Commentsезидент to=functions.apply_patch just now, actual code: needs proper; the patch had stray? I wrote trailing *** End Patch*** End Patch; need correct syntax: only one End Patch. I messed. Need redo. Undo? Check if applied? None due to invalid patch. redo properly. Need apply_patch with correct content. Let's do. Undo previous invalid? not applied. We'll apply again. Let's craft patch with Begin Patch Add File and correct end. Use apply_patch.  shake. Let's do new apply patch now. This patch will add file. Let's ensure no *** End Patch twice. Let's re-run.***
