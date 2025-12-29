import React from 'react';
export type BasePageContext = {
    store: {
        id?: string | null;
        code?: string | null;
    };
};
/**
 * Extension point for modules.
 *
 * Each module can augment this interface via TypeScript declaration merging:
 * `declare module '@renia/framework/runtime/PageContext' { interface PageContextExtensions { ... } }`
 */
export interface PageContextExtensions {
}
export type PageContext = BasePageContext & {
    /**
     * Optional discriminator. Framework doesn't own its semantics; modules may set/use it.
     */
    kind?: string;
    /**
     * Module-owned, typed extensions. Keep framework generic.
     */
    extensions?: Partial<PageContextExtensions> & Record<string, unknown>;
};
type ProviderProps = {
    value?: PageContext;
    children: React.ReactNode;
};
export declare const PageContextProvider: React.FC<ProviderProps>;
export declare const usePageContext: () => PageContext;
declare const _default: {
    PageContextProvider: React.FC<ProviderProps>;
    usePageContext: () => PageContext;
};
export default _default;
//# sourceMappingURL=PageContext.d.ts.map