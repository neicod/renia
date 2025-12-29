# renia-magento-graphql-client

Lekki pomocnik do budowania żądań GraphQL do Magento. Opakowuje `GraphQLRequest` z `renia-graphql-client` i automatycznie wstrzykuje endpoint (proxy lub bezpośredni).

## Użycie

```ts
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

const request = MagentoGraphQLRequestFactory.create({
  payload: `
    query GetSomething($id: String!) {
      product(id: $id) { name }
    }
  `,
  variables: { id: 'sku-123' }
});
// request ma już ustawiony endpoint, można podać do executeRequest()
```

Endpoint jest pobierany z `config.integrations.magento` (SSR: request-scoped config, CSR: `window.__APP_BOOTSTRAP__.config`) w kolejności:
1) `proxyEndpoint` (preferowane w przeglądarce),
2) `graphqlEndpoint`,
3) fallback `/api/magento/graphql`.

Endpoint jest rozwiązywany wewnątrz serwisu (nie tworzysz obiektów ani nie przekazujesz własnego endpointu).
