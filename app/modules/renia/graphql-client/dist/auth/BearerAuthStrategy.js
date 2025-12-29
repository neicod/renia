// @env: mixed
export class BearerAuthStrategy {
    constructor(token) {
        this.token = token;
        this.type = 'bearer';
    }
    apply(headers) {
        headers['authorization'] = `Bearer ${this.token}`;
    }
}
