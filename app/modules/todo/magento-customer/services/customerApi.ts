// @env: mixed
import { gql } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';

const buildGenerateTokenMutation = () => {
  const builder = new QueryBuilder('mutation').setName('GenerateCustomerToken');
  builder.setVariable('email', 'String!');
  builder.setVariable('password', 'String!');
  builder.add(gql`
    generateCustomerToken(email: $email, password: $password)
  `);
  return builder;
};

const buildCreateCustomerMutation = () => {
  const builder = new QueryBuilder('mutation').setName('CreateCustomer');
  builder.setVariable('input', 'CustomerInput!');
  builder.add(gql`
    createCustomer(input: $input) {
      customer {
        id
        email
        firstname
        lastname
        is_subscribed
      }
    }
  `);
  return builder;
};

const buildCustomerQuery = () => {
  const builder = new QueryBuilder('query').setName('CustomerDetails');
  builder.add(gql`
    customer {
      email
      firstname
      lastname
    }
  `);
  return builder;
};

const CUSTOMER_CART_QUERY = `
query CustomerCart {
  customerCart {
    id
  }
}
`;

const buildMergeCartsMutation = () => {
  const builder = new QueryBuilder('mutation').setName('MergeCarts');
  builder.setVariable('sourceCartId', 'String!');
  builder.setVariable('destinationCartId', 'String!');
  builder.add(gql`
    mergeCarts(
      source_cart_id: $sourceCartId
      destination_cart_id: $destinationCartId
    ) {
      id
    }
  `);
  return builder;
};

export const customerApi = {
  async generateToken(email: string, password: string): Promise<string> {
    const request = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: buildGenerateTokenMutation(),
      variables: { email, password },
      operationId: 'magentoCustomer.generateToken'
    });
    const response = await executeGraphQLRequest(request);
    if (response.errors) {
      throw new Error('Niepoprawny login lub hasło.');
    }
    const token = (response.data as any)?.generateCustomerToken;
    if (!token || typeof token !== 'string') {
      throw new Error('Serwer nie zwrócił tokenu.');
    }
    return token;
  },

  async createCustomer(input: Record<string, unknown>) {
    const request = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: buildCreateCustomerMutation(),
      variables: {
        input
      },
      operationId: 'magentoCustomer.createCustomer'
    });
    const response = await executeGraphQLRequest(request);
    if (response.errors) {
      throw new Error('Nie udało się utworzyć konta.');
    }
    return (response.data as any)?.createCustomer;
  },

  async fetchCustomer() {
    const request = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: buildCustomerQuery(),
      operationId: 'magentoCustomer.details'
    });
    const response = await executeGraphQLRequest(request);
    if (response.errors) {
      throw new Error('Nie udało się pobrać danych klienta.');
    }
    return (response.data as any)?.customer;
  },

  async fetchCustomerCartId(): Promise<string | null> {
    const request = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: CUSTOMER_CART_QUERY,
      operationId: 'magentoCustomer.cart'
    });
    const response = await executeGraphQLRequest(request);
    if (response.errors) {
      throw new Error('Nie udało się pobrać koszyka klienta.');
    }
    const id = (response.data as any)?.customerCart?.id;
    return id ?? null;
  },

  async mergeCarts(sourceCartId: string, destinationCartId: string): Promise<string> {
    const request = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: buildMergeCartsMutation(),
      variables: { sourceCartId, destinationCartId },
      operationId: 'magentoCustomer.mergeCarts'
    });
    const response = await executeGraphQLRequest(request);
    if (response.errors) {
      throw new Error('Nie udało się scalić koszyków.');
    }
    const mergedId = (response.data as any)?.mergeCarts?.id;
    if (!mergedId) {
      throw new Error('Serwer nie zwrócił ID koszyka po scaleniu.');
    }
    return mergedId;
  }
};

export default customerApi;
