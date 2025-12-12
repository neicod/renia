# renia-magento-graphql-client

Lekki pomocnik do budowania żądań GraphQL do Magento. Opakowuje `GraphQLRequest` z `renia-graphql-client` i automatycznie wstrzykuje endpoint (proxy lub bezpośredni).

## Użycie

```ts
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

const factory = new MagentoGraphQLRequestFactory(); // endpoint z configu lub /api/magento/graphql

const request = factory.create({
  payload: `
    query GetSomething($id: String!) {
      product(id: $id) { name }
    }
  `,
  variables: { id: 'sku-123' }
});
// request ma już ustawiony endpoint, można podać do executeRequest()
```

Endpoint jest pobierany w kolejności: `__APP_CONFIG__.magentoProxyEndpoint`, `__APP_CONFIG__.magentoGraphQLEndpoint`, `window.__APP_BOOTSTRAP__.config`, fallback `/api/magento/graphql`. Endpoint jest rozwiązywany wewnątrz fabryki (konstruktor nie przyjmuje parametrów).
