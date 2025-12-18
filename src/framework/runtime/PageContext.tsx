// @env: mixed
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
 * `declare module '@framework/runtime/PageContext' { interface PageContextExtensions { ... } }`
 */
export interface PageContextExtensions {}

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

const defaultContext: PageContext = {
  store: { id: null, code: null },
  kind: 'default',
  extensions: {}
};

const PageContextReact = React.createContext<PageContext>(defaultContext);

type ProviderProps = {
  value?: PageContext;
  children: React.ReactNode;
};

export const PageContextProvider: React.FC<ProviderProps> = ({ value, children }) => (
  <PageContextReact.Provider value={value ?? defaultContext}>{children}</PageContextReact.Provider>
);

export const usePageContext = (): PageContext => React.useContext(PageContextReact);

export default {
  PageContextProvider,
  usePageContext
};
