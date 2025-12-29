// @env: mixed
import { executeGraphQLRequest } from '@renia/framework/api/graphqlClient';
import type { AuthOption, GraphQLRequest } from 'renia-graphql-client';
import { QueryBuilder } from 'renia-graphql-client/builder';
import type { MenuItem } from 'renia-menu';
import { MagentoGraphQLRequestFactory } from 'renia-magento-graphql-client';
import { toAbsolutePath } from '@renia/framework/router/paths';

type BeforeSendHook = (
  req: GraphQLRequest,
  ctx: { query: string }
) => Promise<GraphQLRequest | void> | GraphQLRequest | void;

export type FetchMenuOptions = {
  depth?: number;
  auth?: AuthOption[];
  headers?: Record<string, string>;
  variables?: Record<string, unknown>;
  timeoutMs?: number;
  beforeSend?: BeforeSendHook[];
};

const DEFAULT_DEPTH = 2;
// TODO: pobierz identyfikator root kategorii z konfiguracji Magento zamiast stałej.
const DEFAULT_ROOT_CATEGORY_ID = '2';

const buildCategoryQuery = (depth: number): string => {
  const renderFields = (level: number): string => {
    const base = `
      uid
      name
      url_path
      include_in_menu
      position
    `;
    if (level <= 0) return `{ ${base} }`;
    const children = renderFields(level - 1);
    return `{ ${base} children ${children} }`;
  };

  const selection = renderFields(depth);
  return `
    query CategoryMenu($filters: CategoryFilterInput) {
      categoryList(filters: $filters) ${selection}
    }
  `;
};

const mapNodesToMenu = (nodes?: any[]): MenuItem[] => {
  if (!nodes || !Array.isArray(nodes)) return [];

  return nodes
    .filter((node) => node && node.include_in_menu !== false)
    .map((node) => ({
      id: String(node.uid ?? node.id ?? node.name ?? Math.random()),
      label: node.name ?? 'Kategoria',
      url: toAbsolutePath(node.url_path) ?? '#',
      type: 'category',
      position: typeof node.position === 'number' ? node.position : undefined,
      includeInMenu: node.include_in_menu !== false,
      children: mapNodesToMenu(node.children)
    }));
};

const runBeforeSend = async (req: GraphQLRequest, hooks: BeforeSendHook[], ctx: { query: string }) => {
  let current = req;
  for (const hook of hooks) {
    const updated = await hook(current, ctx);
    if (updated) {
      current = updated;
    }
  }
  return current;
};

export const fetchMenu = async (options: FetchMenuOptions): Promise<MenuItem[]> => {
  const endpoint = MagentoGraphQLRequestFactory.getEndpoint();
  const cacheKey = [
    endpoint,
    options.depth ?? DEFAULT_DEPTH,
    options.variables ? JSON.stringify(options.variables) : 'default'
  ].join('::');

  const cache =
    (globalThis as any).__RENIA_MENU_CACHE__ ||
    ((globalThis as any).__RENIA_MENU_CACHE__ = new Map<string, Promise<MenuItem[]>>());

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const task = (async () => {
    const depth = options.depth ?? DEFAULT_DEPTH;
    const query = new QueryBuilder(buildCategoryQuery(depth)).toString();

    const baseHeaders: Record<string, string> = { ...(options.headers ?? {}) };

    const baseRequest: GraphQLRequest = MagentoGraphQLRequestFactory.create({
      method: 'POST',
      payload: query,
      variables: options.variables ?? {
        filters: { parent_id: { eq: DEFAULT_ROOT_CATEGORY_ID } }
      },
      auth: options.auth,
      headers: baseHeaders,
      timeoutMs: options.timeoutMs,
      operationId: 'magentoCategory.menu'
    });

    const finalRequest =
      options.beforeSend && options.beforeSend.length
        ? await runBeforeSend(baseRequest, options.beforeSend, { query })
        : baseRequest;

    const response = await executeGraphQLRequest(finalRequest);

    if (response.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
    }

    const list = (response.data as any)?.categoryList;
    if (!Array.isArray(list)) {
      throw new Error('Brak danych categoryList w odpowiedzi GraphQL');
    }

    return mapNodesToMenu(list);
  })();

  cache.set(cacheKey, task);
  return task;
};

export default {
  fetchMenu
};
