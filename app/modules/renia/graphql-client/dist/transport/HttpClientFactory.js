// @env: mixed
import { FetchHttpClient } from './FetchHttpClient';
let defaultHttpClient = null;
export const registerHttpClient = (client) => {
    defaultHttpClient = client;
};
export const getHttpClient = () => {
    if (defaultHttpClient) {
        return defaultHttpClient;
    }
    return new FetchHttpClient();
};
export const resetHttpClient = () => {
    defaultHttpClient = null;
};
