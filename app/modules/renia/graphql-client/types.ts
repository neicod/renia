// @env: mixed
export type ArgValue = string | number | boolean | null;

export type SelectionNode = {
  name: string;
  alias?: string;
  args?: Record<string, ArgValue>;
  children?: SelectionNode[];
  fragment?: string;
  inline?: string;
};

export type FragmentDef = {
  name: string;
  on?: string;
  selection: SelectionNode[];
};

export type OperationKind = 'query' | 'mutation';

export type Operation = {
  type: OperationKind;
  name?: string;
  variables?: Record<string, string>;
  selection: SelectionNode[];
  fragments?: Record<string, FragmentDef>;
};

export type BearerAuth = { type: 'bearer'; token: string };
export type BasicAuth = { type: 'basic'; username: string; password: string };
export type HeaderAuth = { type: 'header'; name: string; value: string };

export type AuthOption = BearerAuth | BasicAuth | HeaderAuth;

export type GraphQLPayload =
  | string
  | {
      toObject: () => Operation;
      toString: () => string;
    };

export type GraphQLRequest = {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload: GraphQLPayload;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  auth?: AuthOption[];
  timeoutMs?: number;
  operationId?: string;
};

export type GraphQLResponse<T = any> = {
  data?: T;
  errors?: unknown;
  status: number;
  headers: Record<string, string>;
};
