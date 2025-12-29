// @env: mixed
export class ResponseHandler {
    async handle(response) {
        this.validateStatus(response.status);
        const text = await response.text();
        let parsed;
        try {
            parsed = text ? JSON.parse(text) : {};
        }
        catch {
            parsed = {};
        }
        return {
            data: parsed.data,
            errors: parsed.errors,
            status: response.status,
            headers: response.headers
        };
    }
    validateStatus(status) {
        if (status === 401 || status === 403) {
            throw new Error(`Auth error: HTTP ${status}`);
        }
    }
}
