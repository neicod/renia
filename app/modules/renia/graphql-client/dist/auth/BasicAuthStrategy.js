// @env: mixed
export class BasicAuthStrategy {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.type = 'basic';
    }
    apply(headers) {
        const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        headers['authorization'] = `Basic ${credentials}`;
    }
}
