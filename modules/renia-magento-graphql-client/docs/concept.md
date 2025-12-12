# renia-magento-graphql-client — concept

- Cel: uprościć tworzenie `GraphQLRequest` do Magento, tak by endpoint był wstrzykiwany automatycznie (proxy `/api/magento/graphql` lub bezpośredni z konfiguracji SSR/bootstrapa).
- Zależności: `renia-graphql-client` (wykonanie requestu, typy).
- Główne elementy:
- `readMagentoEndpoint()` — odczytuje endpoint z `__APP_CONFIG__` lub `__APP_BOOTSTRAP__.config`, fallback `/api/magento/graphql` (używane wyłącznie wewnątrz fabryki).
- `MagentoGraphQLRequestFactory` — trzyma endpoint (ustawiany wewnątrz z konfiguracji), metoda `create` buduje kompletny `GraphQLRequest` (default `POST`).
- Użycie: utwórz fabrykę raz na moduł/serwis i generuj z niej requesty, a następnie wykonuj je przez `executeRequest` z `renia-graphql-client`.
