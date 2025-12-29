// @env: mixed
import { registerGraphQLHeaderAugmenter } from '@renia/framework/api/graphqlClient';
import { readAppConfig } from '@renia/framework/runtime/appConfig';

const readBootstrapStoreCode = (): string | undefined => {
  const config = readAppConfig();
  const storeCode =
    (typeof config.storeCode === 'string' ? config.storeCode : undefined) ??
    (typeof (config as any)?.store?.code === 'string' ? ((config as any).store.code as string) : undefined) ??
    (typeof (config.integrations as any)?.magento?.storeCode === 'string' ? (config.integrations as any).magento.storeCode : undefined);

  return storeCode ?? process.env.MAGENTO_STORE_CODE ?? undefined;
};

export const resolveRuntimeStoreCode = (): string | undefined => readBootstrapStoreCode();

const storeHeaderAugmenter = (headers: Record<string, string>) => {
  const storeCode = resolveRuntimeStoreCode();
  if (storeCode && !headers.store) {
    headers.store = storeCode;
  }
};

registerGraphQLHeaderAugmenter(storeHeaderAugmenter);
