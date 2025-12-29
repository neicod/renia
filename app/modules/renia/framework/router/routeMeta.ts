// @env: mixed

export type KnownRouteType =
  | 'default'
  | 'magento-route'
  | 'search'
  | 'category'
  | 'product'
  | 'cms'
  | 'redirect'
  | 'not-found'
  | 'auth';

export type RouteMetaBase = Record<string, unknown> & {
  type?: KnownRouteType | (string & {});
  layout?: string;
  __ssrPath?: string;
};

export type RedirectRouteMeta = RouteMetaBase & {
  type: 'redirect';
  redirectTo: string;
  redirectCode: number;
};

export type NotFoundRouteMeta = RouteMetaBase & {
  type: 'not-found';
};

export type CategoryRouteMeta = RouteMetaBase & {
  type: 'category';
  category?: {
    id?: string | null;
    label?: string | null;
    urlPath?: string | null;
    description?: string | null;
    image?: string | null;
  } | null;
  categoryProductListing?: unknown;
};

export type ProductRouteMeta = RouteMetaBase & {
  type: 'product';
  productUrlKey?: string | null;
  product?: unknown;
};

export type CmsRouteMeta = RouteMetaBase & {
  type: 'cms';
  cmsPageIdentifier?: string | null;
  cmsPage?: unknown;
};

export type SearchRouteMeta = RouteMetaBase & {
  type: 'search';
  searchQuery?: string;
  searchProductListing?: unknown;
};

export type RouteMeta =
  | RedirectRouteMeta
  | NotFoundRouteMeta
  | CategoryRouteMeta
  | ProductRouteMeta
  | CmsRouteMeta
  | SearchRouteMeta
  | RouteMetaBase;

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export const isRedirectRouteMeta = (meta: RouteMeta | null | undefined): meta is RedirectRouteMeta => {
  if (!meta || typeof meta !== 'object') return false;
  return (
    (meta as any).type === 'redirect' &&
    typeof (meta as any).redirectTo === 'string' &&
    typeof (meta as any).redirectCode === 'number'
  );
};

export const normalizeRouteMeta = (input: unknown): RouteMeta => {
  const raw = isPlainObject(input) ? { ...input } : {};

  if (typeof (raw as any).type !== 'string') delete (raw as any).type;
  if (typeof (raw as any).layout !== 'string') delete (raw as any).layout;
  if (typeof (raw as any).__ssrPath !== 'string') delete (raw as any).__ssrPath;

  const type = typeof (raw as any).type === 'string' ? String((raw as any).type) : undefined;

  if (type === 'redirect') {
    const redirectTo = (raw as any).redirectTo;
    const redirectCode = (raw as any).redirectCode;
    const ok = typeof redirectTo === 'string' && !!redirectTo && typeof redirectCode === 'number' && !!redirectCode;
    if (!ok) {
      // Invalid redirect meta would break SSR/CSR navigation; downgrade to a safe default.
      delete (raw as any).redirectTo;
      delete (raw as any).redirectCode;
      (raw as any).type = 'default';
    }
  }

  if (type === 'category' && 'category' in raw) {
    const category = (raw as any).category;
    if (category !== null && category !== undefined && !isPlainObject(category)) {
      delete (raw as any).category;
    }
  }

  return raw as RouteMeta;
};

export default {
  normalizeRouteMeta,
  isRedirectRouteMeta
};

