// @env: mixed
export class HeaderAuthStrategy {
    constructor(name, value) {
        this.name = name;
        this.value = value;
        this.type = 'header';
    }
    apply(headers) {
        headers[this.name.toLowerCase()] = this.value;
    }
}
