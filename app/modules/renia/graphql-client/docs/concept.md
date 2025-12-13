# Koncepcja: renia-graphql-client

Cel: budowanie i wykonywanie zapytań/mutacji GraphQL z obsługą autoryzacji, timeoutu i serializowalnych struktur.

Składniki:
- `QueryBuilder` — obiektowy builder operacji (`query`/`mutation`), pola, fragmenty, inline fragmenty, usuwanie pól, `toObject()`/`toString()`.
- Typy requestu (`GraphQLRequest`): `endpoint`, `method` (POST/GET...), `payload` (string lub builder/operation), `variables`, `headers`, `auth` (bearer/basic/header), `timeoutMs` (domyślnie 5s).
- `executeRequest` — wysyłka zapytania (wbudowany `fetch`), serializacja payloadu, auth, timeout, prosta obsługa błędów (timeout, 401/403).

Konwencje:
- Payload preferencyjnie z buildera; dane mają być serializowalne (string + variables).
- Brak hooków na transport; wyższe warstwy mogą dekorować, ale moduł używa wbudowanego `fetch`.
- Auth i nagłówki są dodawane przez typowane strategie (`bearer`, `basic`, `header`).
