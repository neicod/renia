// @env: mixed
import { readAppConfig } from '@renia/framework/runtime/appConfig';
export const readEndpoint = () => {
    const cfg = readAppConfig();
    const magento = cfg.integrations?.magento ?? {};
    const proxyEndpoint = typeof magento.proxyEndpoint === 'string' ? magento.proxyEndpoint : undefined;
    const graphqlEndpoint = typeof magento.graphqlEndpoint === 'string' ? magento.graphqlEndpoint : undefined;
    if (proxyEndpoint)
        return proxyEndpoint;
    if (graphqlEndpoint)
        return graphqlEndpoint;
    return undefined;
};
