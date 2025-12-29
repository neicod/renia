export type KnownRouteType = 'default' | 'magento-route' | 'search' | 'category' | 'product' | 'cms' | 'redirect' | 'not-found' | 'auth';
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
export type RouteMeta = RedirectRouteMeta | NotFoundRouteMeta | CategoryRouteMeta | ProductRouteMeta | CmsRouteMeta | SearchRouteMeta | RouteMetaBase;
export declare const isRedirectRouteMeta: (meta: RouteMeta | null | undefined) => meta is RedirectRouteMeta;
export declare const normalizeRouteMeta: (input: unknown) => RouteMeta;
declare const _default: {
    normalizeRouteMeta: (input: unknown) => RouteMeta;
    isRedirectRouteMeta: (meta: RouteMeta | null | undefined) => meta is RedirectRouteMeta;
};
export default _default;
//# sourceMappingURL=routeMeta.d.ts.map