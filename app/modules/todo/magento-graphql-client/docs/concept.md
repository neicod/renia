# renia-magento-graphql-client — concept

- Cel: uprościć tworzenie `GraphQLRequest` do Magento, tak by endpoint był wstrzykiwany automatycznie (proxy `/api/magento/graphql` lub bezpośredni z konfiguracji SSR/bootstrapa).
- Zależności: `renia-graphql-client` (wykonanie requestu, typy).
- Główne elementy:
- `readMagentoEndpoint()` — odczytuje endpoint z `config.integrations.magento` (SSR: request-scoped config, CSR: `__APP_BOOTSTRAP__.config`), fallback `/api/magento/graphql` (używane wyłącznie wewnątrz fabryki).
- `MagentoGraphQLRequestFactory` — serwis udostępniający `getEndpoint()` oraz `create()` budujące kompletny `GraphQLRequest` (default `POST`); nie wymaga instancjonowania.
- Użycie: importuj serwis i wywołuj `MagentoGraphQLRequestFactory.create(...)`, a następnie wykonuj request przez `executeRequest` z `renia-graphql-client`.
