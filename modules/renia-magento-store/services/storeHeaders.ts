2// @env: mixed
import { registerGraphQLHeaderAugmenter } from '@framework/api/graphqlClient';

const readBootstrapStoreCode = (): string | undefined => {
  if (typeof window !== 'undefined') {
    const bootstrap = (window as any).__APP_BOOTSTRAP__;
    const config = bootstrap?.config ?? {};
    return config.magentoStoreCode ?? config.store?.code;
  }
  const globalConfig = (globalThis as any).__APP_CONFIG__ ?? {};
  return (
    globalConfig.magentoStoreCode ??
    globalConfig.store?.code ??
    process.env.MAGENTO_STORE_CODE ??
    undefined
  );
};

export const resolveRuntimeStoreCode = (): string | undefined => readBootstrapStoreCode();

const storeHeaderAugmenter = (headers: Record<string, string>) => {
  const storeCode = resolveRuntimeStoreCode();
  if (storeCode && !headers.store) {
    headers.store = storeCode;
  }
};

registerGraphQLHeaderAugmenter(storeHeaderAugmenter);
