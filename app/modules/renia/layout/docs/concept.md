# Koncepcja: renia-layout

Cel: rejestr slotów i definicji layoutów. Dostarcza listę slotów w aktywnych modułach oraz wbudowane układy (1column, 2column-left). Dane używane do renderowania przez AppRoot.

Założenia:
- Layouty wbudowane: `1column` (header, control-menu, content, footer), `2column-left` (header, control-menu, left, content, footer).
- Sloty pochodzą z plików `layout.ts/.js/.json` modułów (serializowalne wpisy: `slot`, `componentPath`/`component`, `priority`, `id?`, `enabled?`).
- Sloty są deduplikowane po `id` (lub componentPath/slot) i sortowane po `priority`; `enabled: false` wyłącza wpis.
- Rejestr zwraca `{ slots, flat, layouts }`, gdzie `slots` to mapy slotów, `layouts` to definicje układów.

Konwencje:
- Nie stosujemy zagnieżdżonych slotów; layout decyduje, gdzie osadzić poszczególne sloty.
- Wpisy slotów wstrzykuj interceptorami lub plikami layoutów; `componentPath` zapewnia serializowalność.
