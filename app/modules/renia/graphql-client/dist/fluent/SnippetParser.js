// @env: mixed
const isNameStart = (ch) => /[A-Za-z_]/.test(ch);
const isNameContinue = (ch) => /[A-Za-z0-9_]/.test(ch);
const isDigit = (ch) => /[0-9]/.test(ch);
class Lexer {
    constructor(src) {
        this.src = src;
        this.i = 0;
    }
    peek(offset = 0) {
        return this.src[this.i + offset] ?? '';
    }
    nextChar() {
        return this.src[this.i++] ?? '';
    }
    eof() {
        return this.i >= this.src.length;
    }
    skipWhitespaceAndComments() {
        while (!this.eof()) {
            const ch = this.peek();
            if (ch === '#') {
                while (!this.eof() && this.peek() !== '\n')
                    this.nextChar();
                continue;
            }
            if (/\s/.test(ch)) {
                this.nextChar();
                continue;
            }
            break;
        }
    }
    next() {
        this.skipWhitespaceAndComments();
        if (this.eof())
            return { kind: 'EOF' };
        const ch = this.peek();
        if (ch === '.' && this.peek(1) === '.' && this.peek(2) === '.') {
            this.i += 3;
            return { kind: 'SPREAD' };
        }
        // Punctuators (single-char)
        if ('!$():=@[]{}'.includes(ch) || ch === ',') {
            this.nextChar();
            return { kind: 'PUNCT', value: ch };
        }
        // String literal
        if (ch === '"') {
            // Block string """..."""
            if (this.peek(1) === '"' && this.peek(2) === '"') {
                const start = this.i;
                this.i += 3;
                while (!this.eof()) {
                    if (this.peek() === '"' && this.peek(1) === '"' && this.peek(2) === '"') {
                        this.i += 3;
                        const raw = this.src.slice(start, this.i);
                        return { kind: 'STRING', raw };
                    }
                    this.nextChar();
                }
                throw new Error('Unterminated block string literal in GraphQL snippet');
            }
            const start = this.i;
            this.nextChar(); // opening "
            while (!this.eof()) {
                const c = this.nextChar();
                if (c === '\\') {
                    this.nextChar(); // escape char
                    continue;
                }
                if (c === '"') {
                    const raw = this.src.slice(start, this.i);
                    return { kind: 'STRING', raw };
                }
            }
            throw new Error('Unterminated string literal in GraphQL snippet');
        }
        // Number
        if (ch === '-' || isDigit(ch)) {
            const start = this.i;
            if (ch === '-')
                this.nextChar();
            while (isDigit(this.peek()))
                this.nextChar();
            if (this.peek() === '.' && isDigit(this.peek(1))) {
                this.nextChar();
                while (isDigit(this.peek()))
                    this.nextChar();
            }
            const raw = this.src.slice(start, this.i);
            const value = Number(raw);
            if (!Number.isFinite(value))
                throw new Error(`Invalid number literal: ${raw}`);
            return { kind: 'NUMBER', value, raw };
        }
        // Name
        if (isNameStart(ch)) {
            const start = this.i;
            this.nextChar();
            while (isNameContinue(this.peek()))
                this.nextChar();
            return { kind: 'NAME', value: this.src.slice(start, this.i) };
        }
        throw new Error(`Unexpected character in GraphQL snippet: ${JSON.stringify(ch)}`);
    }
}
class Parser {
    constructor(src) {
        this.lexer = new Lexer(src);
        this.lookahead = this.lexer.next();
    }
    consume() {
        const t = this.lookahead;
        this.lookahead = this.lexer.next();
        return t;
    }
    expectPunct(value) {
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === value) {
            this.consume();
            return;
        }
        throw new Error(`Expected "${value}" in GraphQL snippet`);
    }
    maybePunct(value) {
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === value) {
            this.consume();
            return true;
        }
        return false;
    }
    isPunct(value) {
        return this.lookahead.kind === 'PUNCT' && this.lookahead.value === value;
    }
    isEof() {
        return this.lookahead.kind === 'EOF';
    }
    expectName() {
        if (this.lookahead.kind === 'NAME')
            return this.consume().value;
        throw new Error('Expected NAME in GraphQL snippet');
    }
    parseValue() {
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '$') {
            this.consume();
            const name = this.expectName();
            return `$${name}`;
        }
        if (this.lookahead.kind === 'STRING')
            return this.consume().raw;
        if (this.lookahead.kind === 'NUMBER')
            return this.consume().value;
        if (this.lookahead.kind === 'NAME') {
            const name = this.consume().value;
            if (name === 'true')
                return true;
            if (name === 'false')
                return false;
            if (name === 'null')
                return null;
            return name; // enum literal
        }
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '[') {
            this.consume();
            const items = [];
            while (!this.isPunct(']')) {
                if (this.maybePunct(','))
                    continue;
                items.push(this.parseValue());
                this.maybePunct(',');
            }
            this.expectPunct(']');
            return items;
        }
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '{') {
            this.consume();
            const obj = {};
            while (!this.isPunct('}')) {
                if (this.maybePunct(','))
                    continue;
                const key = this.expectName();
                this.expectPunct(':');
                obj[key] = this.parseValue();
                this.maybePunct(',');
            }
            this.expectPunct('}');
            return obj;
        }
        throw new Error('Unsupported GraphQL value in snippet');
    }
    parseArgs() {
        if (!(this.lookahead.kind === 'PUNCT' && this.lookahead.value === '('))
            return undefined;
        this.consume();
        const args = {};
        while (!this.isPunct(')')) {
            if (this.maybePunct(','))
                continue;
            const key = this.expectName();
            this.expectPunct(':');
            args[key] = this.parseValue();
            this.maybePunct(',');
        }
        this.expectPunct(')');
        return args;
    }
    parseDirectives() {
        const directives = [];
        while (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '@') {
            this.consume();
            const name = this.expectName();
            const args = this.parseArgs();
            directives.push({ name, args });
        }
        return directives.length ? directives : undefined;
    }
    parseSelectionSet() {
        this.expectPunct('{');
        const nodes = [];
        while (!this.isPunct('}')) {
            nodes.push(this.parseSelection());
        }
        this.expectPunct('}');
        return nodes;
    }
    parseSelection() {
        if (this.lookahead.kind === 'SPREAD') {
            this.consume();
            const nameOrOn = this.expectName();
            if (nameOrOn === 'on') {
                const onType = this.expectName();
                const directives = this.parseDirectives();
                const children = this.parseSelectionSet();
                return { name: '__inline', inline: onType, directives, children };
            }
            const fragmentName = nameOrOn;
            const directives = this.parseDirectives();
            return { name: fragmentName, fragment: fragmentName, directives };
        }
        const first = this.expectName();
        if (first === 'query' || first === 'mutation' || first === 'fragment' || first === 'subscription') {
            throw new Error(`GraphQL snippet looks like a document ("${first} ..."). Pass only selection set snippets to add/merge.`);
        }
        // alias?
        let alias;
        let name = first;
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === ':') {
            this.consume();
            alias = first;
            name = this.expectName();
        }
        const args = this.parseArgs();
        const directives = this.parseDirectives();
        const children = this.lookahead.kind === 'PUNCT' && this.lookahead.value === '{' ? this.parseSelectionSet() : undefined;
        return { name, alias, args, directives, children };
    }
    parseSnippet() {
        if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '{') {
            const nodes = this.parseSelectionSet();
            if (!this.isEof())
                throw new Error('Unexpected tokens after selection set');
            return nodes;
        }
        const nodes = [];
        while (!this.isEof()) {
            nodes.push(this.parseSelection());
        }
        return nodes;
    }
}
export class SnippetParser {
    parseSelectionSnippet(source) {
        const src = source.trim();
        if (!src)
            return [];
        const parser = new Parser(src);
        return parser.parseSnippet();
    }
}
