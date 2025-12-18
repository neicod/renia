// @env: mixed

import type { ArgValue, DirectiveNode, SelectionNode } from '../types';

type Token =
  | { kind: 'NAME'; value: string }
  | { kind: 'NUMBER'; value: number; raw: string }
  | { kind: 'STRING'; raw: string }
  | { kind: 'SPREAD' }
  | { kind: 'PUNCT'; value: string }
  | { kind: 'EOF' };

const isNameStart = (ch: string) => /[A-Za-z_]/.test(ch);
const isNameContinue = (ch: string) => /[A-Za-z0-9_]/.test(ch);
const isDigit = (ch: string) => /[0-9]/.test(ch);

class Lexer {
  private i = 0;

  constructor(private readonly src: string) {}

  private peek(offset = 0): string {
    return this.src[this.i + offset] ?? '';
  }

  private nextChar(): string {
    return this.src[this.i++] ?? '';
  }

  private eof(): boolean {
    return this.i >= this.src.length;
  }

  private skipWhitespaceAndComments() {
    while (!this.eof()) {
      const ch = this.peek();
      if (ch === '#' ) {
        while (!this.eof() && this.peek() !== '\n') this.nextChar();
        continue;
      }
      if (/\s/.test(ch)) {
        this.nextChar();
        continue;
      }
      break;
    }
  }

  next(): Token {
    this.skipWhitespaceAndComments();
    if (this.eof()) return { kind: 'EOF' };

    const ch = this.peek();
    if (ch === '.' && this.peek(1) === '.' && this.peek(2) === '.') {
      this.i += 3;
      return { kind: 'SPREAD' };
    }

    // Punctuators (single-char)
    if ('!$():=@[]{}'.includes(ch) || ch === ',' ) {
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
      if (ch === '-') this.nextChar();
      while (isDigit(this.peek())) this.nextChar();
      if (this.peek() === '.' && isDigit(this.peek(1))) {
        this.nextChar();
        while (isDigit(this.peek())) this.nextChar();
      }
      const raw = this.src.slice(start, this.i);
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error(`Invalid number literal: ${raw}`);
      return { kind: 'NUMBER', value, raw };
    }

    // Name
    if (isNameStart(ch)) {
      const start = this.i;
      this.nextChar();
      while (isNameContinue(this.peek())) this.nextChar();
      return { kind: 'NAME', value: this.src.slice(start, this.i) };
    }

    throw new Error(`Unexpected character in GraphQL snippet: ${JSON.stringify(ch)}`);
  }
}

class Parser {
  private lookahead: Token;

  constructor(src: string) {
    this.lexer = new Lexer(src);
    this.lookahead = this.lexer.next();
  }

  private readonly lexer: Lexer;

  private consume(): Token {
    const t = this.lookahead;
    this.lookahead = this.lexer.next();
    return t;
  }

  private expectPunct(value: string) {
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === value) {
      this.consume();
      return;
    }
    throw new Error(`Expected "${value}" in GraphQL snippet`);
  }

  private maybePunct(value: string): boolean {
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === value) {
      this.consume();
      return true;
    }
    return false;
  }

  private expectName(): string {
    if (this.lookahead.kind === 'NAME') return (this.consume() as any).value as string;
    throw new Error('Expected NAME in GraphQL snippet');
  }

  private parseValue(): ArgValue {
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '$') {
      this.consume();
      const name = this.expectName();
      return `$${name}`;
    }
    if (this.lookahead.kind === 'STRING') return (this.consume() as any).raw as string;
    if (this.lookahead.kind === 'NUMBER') return (this.consume() as any).value as number;
    if (this.lookahead.kind === 'NAME') {
      const name = (this.consume() as any).value as string;
      if (name === 'true') return true;
      if (name === 'false') return false;
      if (name === 'null') return null;
      return name; // enum literal
    }
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '[') {
      this.consume();
      const items: ArgValue[] = [];
      while (!(this.lookahead.kind === 'PUNCT' && this.lookahead.value === ']')) {
        if (this.maybePunct(',')) continue;
        items.push(this.parseValue());
        this.maybePunct(',');
      }
      this.expectPunct(']');
      return items;
    }
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '{') {
      this.consume();
      const obj: Record<string, ArgValue> = {};
      while (!(this.lookahead.kind === 'PUNCT' && this.lookahead.value === '}')) {
        if (this.maybePunct(',')) continue;
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

  private parseArgs(): Record<string, ArgValue> | undefined {
    if (!(this.lookahead.kind === 'PUNCT' && this.lookahead.value === '(')) return undefined;
    this.consume();
    const args: Record<string, ArgValue> = {};
    while (!(this.lookahead.kind === 'PUNCT' && this.lookahead.value === ')')) {
      if (this.maybePunct(',')) continue;
      const key = this.expectName();
      this.expectPunct(':');
      args[key] = this.parseValue();
      this.maybePunct(',');
    }
    this.expectPunct(')');
    return args;
  }

  private parseDirectives(): DirectiveNode[] | undefined {
    const directives: DirectiveNode[] = [];
    while (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '@') {
      this.consume();
      const name = this.expectName();
      const args = this.parseArgs();
      directives.push({ name, args });
    }
    return directives.length ? directives : undefined;
  }

  private parseSelectionSet(): SelectionNode[] {
    this.expectPunct('{');
    const nodes: SelectionNode[] = [];
    while (!(this.lookahead.kind === 'PUNCT' && this.lookahead.value === '}')) {
      nodes.push(this.parseSelection());
    }
    this.expectPunct('}');
    return nodes;
  }

  private parseSelection(): SelectionNode {
    if (this.lookahead.kind === 'SPREAD') {
      this.consume();
      if (this.lookahead.kind === 'NAME' && this.lookahead.value === 'on') {
        this.consume(); // on
        const onType = this.expectName();
        const directives = this.parseDirectives();
        const children = this.parseSelectionSet();
        return { name: '__inline', inline: onType, directives, children };
      }
      const fragmentName = this.expectName();
      const directives = this.parseDirectives();
      return { name: fragmentName, fragment: fragmentName, directives };
    }

    const first = this.expectName();
    if (first === 'query' || first === 'mutation' || first === 'fragment' || first === 'subscription') {
      throw new Error(
        `GraphQL snippet looks like a document ("${first} ..."). Pass only selection set snippets to add/merge.`
      );
    }

    // alias?
    let alias: string | undefined;
    let name = first;
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === ':') {
      this.consume();
      alias = first;
      name = this.expectName();
    }

    const args = this.parseArgs();
    const directives = this.parseDirectives();
    const children =
      this.lookahead.kind === 'PUNCT' && this.lookahead.value === '{' ? this.parseSelectionSet() : undefined;

    return { name, alias, args, directives, children };
  }

  parseSnippet(): SelectionNode[] {
    if (this.lookahead.kind === 'PUNCT' && this.lookahead.value === '{') {
      const nodes = this.parseSelectionSet();
      if (this.lookahead.kind !== 'EOF') throw new Error('Unexpected tokens after selection set');
      return nodes;
    }

    const nodes: SelectionNode[] = [];
    while (this.lookahead.kind !== 'EOF') {
      nodes.push(this.parseSelection());
    }
    return nodes;
  }
}

export class SnippetParser {
  parseSelectionSnippet(source: string): SelectionNode[] {
    const src = source.trim();
    if (!src) return [];
    const parser = new Parser(src);
    return parser.parseSnippet();
  }
}

