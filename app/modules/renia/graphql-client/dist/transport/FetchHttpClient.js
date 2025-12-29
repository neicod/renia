// @env: browser
export class FetchHttpClient {
    async execute(url, options) {
        const response = await fetch(url, options);
        return {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            text: () => response.text()
        };
    }
}
