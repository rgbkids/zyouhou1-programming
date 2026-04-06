// Recursive-descent parser for the Info-I language subset

import { Token, tokenize, TokenizeError } from './tokenizer.js';
import type {
  Program, Stmt, Expr, Position,
  Assign, AugAssign, ExprStmt, If, For, While, FuncDef, Return, Break, Continue,
  BinOp, BinOpOp, UnaryOp, Compare, CmpOp, BoolOp, Call, Subscript, Attribute,
  Name, NumberLiteral, StringLiteral, BoolLiteral, NoneLiteral, ListLiteral,
  AssignTarget,
} from './ast.js';

export class ParseError extends Error {
  constructor(msg: string, public line: number, public col: number) {
    super(`[行${line}:列${col}] ${msg}`);
  }
}

export function parse(source: string): Program {
  let tokens: Token[];
  try {
    tokens = tokenize(source);
  } catch (e) {
    if (e instanceof TokenizeError) {
      throw new ParseError(e.message, e.line, e.col);
    }
    throw e;
  }

  const parser = new Parser(tokens);
  return parser.parseProgram();
}

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private peek(): Token {
    return this.tokens[this.pos]!;
  }

  private advance(): Token {
    const t = this.tokens[this.pos]!;
    this.pos++;
    return t;
  }

  private check(kind: Token['kind'], value?: string): boolean {
    const t = this.peek();
    if (t.kind !== kind) return false;
    if (value !== undefined && t.value !== value) return false;
    return true;
  }

  private match(kind: Token['kind'], value?: string): Token | null {
    if (this.check(kind, value)) return this.advance();
    return null;
  }

  private expect(kind: Token['kind'], value?: string): Token {
    const t = this.peek();
    if (t.kind !== kind || (value !== undefined && t.value !== value)) {
      const expected = value ? `'${value}'` : kind;
      throw new ParseError(
        `${expected} が必要ですが '${t.value}' がありました`,
        t.line, t.col
      );
    }
    return this.advance();
  }

  private pos_of(t: Token): Position {
    return { line: t.line, col: t.col };
  }

  private skipNewlines(): void {
    while (this.check('NEWLINE')) this.advance();
  }

  // ─── Program ──────────────────────────────────────────────────────────────

  parseProgram(): Program {
    const body: Stmt[] = [];
    this.skipNewlines();
    while (!this.check('EOF')) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    return { kind: 'Program', body };
  }

  // ─── Statements ───────────────────────────────────────────────────────────

  private parseStatement(): Stmt {
    const t = this.peek();

    if (t.kind === 'NAME' && t.value === 'if') return this.parseIf();
    if (t.kind === 'NAME' && t.value === 'for') return this.parseFor();
    if (t.kind === 'NAME' && t.value === 'while') return this.parseWhile();
    if (t.kind === 'NAME' && t.value === 'def') return this.parseFuncDef();
    if (t.kind === 'NAME' && t.value === 'return') return this.parseReturn();
    if (t.kind === 'NAME' && t.value === 'break') {
      const pos = this.pos_of(this.advance());
      this.expectNewline();
      const b: Break = { kind: 'Break', pos };
      return b;
    }
    if (t.kind === 'NAME' && t.value === 'continue') {
      const pos = this.pos_of(this.advance());
      this.expectNewline();
      const c: Continue = { kind: 'Continue', pos };
      return c;
    }
    if (t.kind === 'NAME' && t.value === 'import') {
      // skip import statements (treated as no-op, builtins are injected)
      while (!this.check('NEWLINE') && !this.check('EOF')) this.advance();
      this.match('NEWLINE');
      // return a dummy ExprStmt with None
      const pos: Position = { line: t.line, col: t.col };
      const none: NoneLiteral = { kind: 'None', pos };
      const stmt: ExprStmt = { kind: 'ExprStmt', expr: none, pos };
      return stmt;
    }
    if (t.kind === 'NAME' && t.value === 'from') {
      while (!this.check('NEWLINE') && !this.check('EOF')) this.advance();
      this.match('NEWLINE');
      const pos: Position = { line: t.line, col: t.col };
      const none: NoneLiteral = { kind: 'None', pos };
      const stmt: ExprStmt = { kind: 'ExprStmt', expr: none, pos };
      return stmt;
    }

    return this.parseSimpleStmt();
  }

  private expectNewline(): void {
    if (!this.match('NEWLINE') && !this.check('EOF') && !this.check('DEDENT')) {
      const t = this.peek();
      throw new ParseError('改行が必要です', t.line, t.col);
    }
  }

  private parseSimpleStmt(): Stmt {
    const expr = this.parseExpr();

    // Augmented assignment
    if (this.check('OP', '+=') || this.check('OP', '-=')) {
      const opTok = this.advance();
      if (expr.kind !== 'Name') {
        throw new ParseError('代入先が変数ではありません', opTok.line, opTok.col);
      }
      const value = this.parseExpr();
      this.expectNewline();
      const aug: AugAssign = {
        kind: 'AugAssign',
        target: { kind: 'Name', id: expr.id, pos: expr.pos },
        op: opTok.value as '+' | '-',
        value,
        pos: expr.pos,
      };
      return aug;
    }

    // Assignment
    if (this.check('OP', '=')) {
      this.advance();
      const value = this.parseExpr();
      this.expectNewline();

      let target: AssignTarget;
      if (expr.kind === 'Name') {
        target = { kind: 'Name', id: expr.id, pos: expr.pos };
      } else if (expr.kind === 'Subscript') {
        target = { kind: 'Subscript', value: expr.value, index: expr.index, pos: expr.pos };
      } else {
        throw new ParseError('代入先が不正です', expr.pos.line, expr.pos.col);
      }

      const assign: Assign = { kind: 'Assign', target, value, pos: expr.pos };
      return assign;
    }

    // Expression statement
    this.expectNewline();
    const stmt: ExprStmt = { kind: 'ExprStmt', expr, pos: expr.pos };
    return stmt;
  }

  // ─── Control flow ─────────────────────────────────────────────────────────

  private parseIf(): If {
    const pos = this.pos_of(this.expect('NAME', 'if'));
    const test = this.parseExpr();
    this.expect('OP', ':');
    this.expect('NEWLINE');
    const body = this.parseSuite();

    let orelse: Stmt[] = [];

    if (this.check('NAME', 'elif')) {
      // treat elif as nested if in orelse
      orelse = [this.parseElif()];
    } else if (this.match('NAME', 'else')) {
      this.expect('OP', ':');
      this.expect('NEWLINE');
      orelse = this.parseSuite();
    }

    return { kind: 'If', test, body, orelse, pos };
  }

  private parseElif(): If {
    const pos = this.pos_of(this.expect('NAME', 'elif'));
    const test = this.parseExpr();
    this.expect('OP', ':');
    this.expect('NEWLINE');
    const body = this.parseSuite();

    let orelse: Stmt[] = [];
    if (this.check('NAME', 'elif')) {
      orelse = [this.parseElif()];
    } else if (this.match('NAME', 'else')) {
      this.expect('OP', ':');
      this.expect('NEWLINE');
      orelse = this.parseSuite();
    }

    return { kind: 'If', test, body, orelse, pos };
  }

  private parseFor(): For {
    const pos = this.pos_of(this.expect('NAME', 'for'));
    const varTok = this.expect('NAME');
    this.expect('NAME', 'in');
    this.expect('NAME', 'range');
    this.expect('OP', '(');

    const args: Expr[] = [this.parseExpr()];
    while (this.match('OP', ',')) {
      args.push(this.parseExpr());
    }
    this.expect('OP', ')');
    this.expect('OP', ':');
    this.expect('NEWLINE');
    const body = this.parseSuite();

    return { kind: 'For', target: varTok.value, rangeArgs: args, body, pos };
  }

  private parseWhile(): While {
    const pos = this.pos_of(this.expect('NAME', 'while'));
    const test = this.parseExpr();
    this.expect('OP', ':');
    this.expect('NEWLINE');
    const body = this.parseSuite();
    return { kind: 'While', test, body, pos };
  }

  private parseFuncDef(): FuncDef {
    const pos = this.pos_of(this.expect('NAME', 'def'));
    const nameTok = this.expect('NAME');
    this.expect('OP', '(');

    const params: string[] = [];
    if (!this.check('OP', ')')) {
      params.push(this.expect('NAME').value);
      while (this.match('OP', ',')) {
        if (this.check('OP', ')')) break;
        params.push(this.expect('NAME').value);
      }
    }
    this.expect('OP', ')');
    this.expect('OP', ':');
    this.expect('NEWLINE');
    const body = this.parseSuite();

    return { kind: 'FuncDef', name: nameTok.value, params, body, pos };
  }

  private parseReturn(): Return {
    const pos = this.pos_of(this.expect('NAME', 'return'));
    let value: Expr | null = null;
    if (!this.check('NEWLINE') && !this.check('EOF') && !this.check('DEDENT')) {
      value = this.parseExpr();
    }
    this.expectNewline();
    return { kind: 'Return', value, pos };
  }

  private parseSuite(): Stmt[] {
    this.expect('INDENT');
    const stmts: Stmt[] = [];
    this.skipNewlines();
    while (!this.check('DEDENT') && !this.check('EOF')) {
      stmts.push(this.parseStatement());
      this.skipNewlines();
    }
    this.expect('DEDENT');
    return stmts;
  }

  // ─── Expressions ──────────────────────────────────────────────────────────

  private parseExpr(): Expr {
    return this.parseOr();
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.check('NAME', 'or')) {
      const pos = this.pos_of(this.advance());
      const right = this.parseAnd();
      const boolOp: BoolOp = {
        kind: 'BoolOp', op: 'or',
        values: left.kind === 'BoolOp' && left.op === 'or'
          ? [...left.values, right]
          : [left, right],
        pos,
      };
      left = boolOp;
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.check('NAME', 'and')) {
      const pos = this.pos_of(this.advance());
      const right = this.parseNot();
      const boolOp: BoolOp = {
        kind: 'BoolOp', op: 'and',
        values: left.kind === 'BoolOp' && left.op === 'and'
          ? [...left.values, right]
          : [left, right],
        pos,
      };
      left = boolOp;
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.check('NAME', 'not')) {
      const pos = this.pos_of(this.advance());
      const operand = this.parseNot();
      const unary: UnaryOp = { kind: 'UnaryOp', op: 'not', operand, pos };
      return unary;
    }
    return this.parseComparison();
  }

  private parseComparison(): Expr {
    const left = this.parseAdd();
    const CMP_OPS: string[] = ['==', '!=', '<', '>', '<=', '>='];

    if (this.check('OP') && CMP_OPS.includes(this.peek().value)) {
      const ops: CmpOp[] = [];
      const comparators: Expr[] = [];
      while (this.check('OP') && CMP_OPS.includes(this.peek().value)) {
        ops.push(this.advance().value as CmpOp);
        comparators.push(this.parseAdd());
      }
      const cmp: Compare = { kind: 'Compare', left, ops, comparators, pos: left.pos };
      return cmp;
    }
    return left;
  }

  private parseAdd(): Expr {
    let left = this.parseMul();
    while (this.check('OP', '+') || this.check('OP', '-')) {
      const op = this.advance().value as BinOpOp;
      const right = this.parseMul();
      const bin: BinOp = { kind: 'BinOp', left, op, right, pos: left.pos };
      left = bin;
    }
    return left;
  }

  private parseMul(): Expr {
    let left = this.parseUnary();
    while (
      this.check('OP', '*') || this.check('OP', '/') ||
      this.check('OP', '//') || this.check('OP', '%')
    ) {
      const op = this.advance().value as BinOpOp;
      const right = this.parseUnary();
      const bin: BinOp = { kind: 'BinOp', left, op, right, pos: left.pos };
      left = bin;
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.check('OP', '-')) {
      const pos = this.pos_of(this.advance());
      const operand = this.parseUnary();
      const unary: UnaryOp = { kind: 'UnaryOp', op: '-', operand, pos };
      return unary;
    }
    return this.parsePower();
  }

  private parsePower(): Expr {
    let base = this.parsePrimary();
    if (this.check('OP', '**')) {
      const pos = this.pos_of(this.advance());
      const exp = this.parseUnary();
      const bin: BinOp = { kind: 'BinOp', left: base, op: '**', right: exp, pos };
      base = bin;
    }
    return base;
  }

  private parsePrimary(): Expr {
    let expr = this.parseAtom();

    while (true) {
      if (this.check('OP', '(')) {
        // function call
        const pos = this.pos_of(this.advance());
        const args: Expr[] = [];
        if (!this.check('OP', ')')) {
          args.push(this.parseExpr());
          while (this.match('OP', ',')) {
            if (this.check('OP', ')')) break;
            args.push(this.parseExpr());
          }
        }
        this.expect('OP', ')');
        const call: Call = { kind: 'Call', func: expr, args, pos };
        expr = call;
      } else if (this.check('OP', '[')) {
        // subscript
        const pos = this.pos_of(this.advance());
        const index = this.parseExpr();
        this.expect('OP', ']');
        const sub: Subscript = { kind: 'Subscript', value: expr, index, pos };
        expr = sub;
      } else if (this.check('OP', '.')) {
        // attribute access (e.g., random.randrange)
        const pos = this.pos_of(this.advance());
        const attr = this.expect('NAME').value;
        if (this.check('OP', '(')) {
          // method call: obj.method(args)
          this.advance();
          const args: Expr[] = [];
          if (!this.check('OP', ')')) {
            args.push(this.parseExpr());
            while (this.match('OP', ',')) {
              if (this.check('OP', ')')) break;
              args.push(this.parseExpr());
            }
          }
          this.expect('OP', ')');
          const attrNode: Attribute = { kind: 'Attribute', value: expr, attr, pos };
          const call: Call = { kind: 'Call', func: attrNode, args, pos };
          expr = call;
        } else {
          const attrNode: Attribute = { kind: 'Attribute', value: expr, attr, pos };
          expr = attrNode;
        }
      } else {
        break;
      }
    }

    return expr;
  }

  private parseAtom(): Expr {
    const t = this.peek();
    const pos: Position = { line: t.line, col: t.col };

    if (t.kind === 'NUMBER') {
      this.advance();
      const num: NumberLiteral = { kind: 'Number', value: Number(t.value), pos };
      return num;
    }

    if (t.kind === 'STRING') {
      this.advance();
      const str: StringLiteral = { kind: 'String', value: t.value, pos };
      return str;
    }

    if (t.kind === 'NAME') {
      if (t.value === 'True') { this.advance(); const b: BoolLiteral = { kind: 'Bool', value: true, pos }; return b; }
      if (t.value === 'False') { this.advance(); const b: BoolLiteral = { kind: 'Bool', value: false, pos }; return b; }
      if (t.value === 'None') { this.advance(); const n: NoneLiteral = { kind: 'None', pos }; return n; }
      this.advance();
      const name: Name = { kind: 'Name', id: t.value, pos };
      return name;
    }

    if (t.kind === 'OP' && t.value === '[') {
      this.advance();
      const elements: Expr[] = [];
      if (!this.check('OP', ']')) {
        elements.push(this.parseExpr());
        while (this.match('OP', ',')) {
          if (this.check('OP', ']')) break;
          elements.push(this.parseExpr());
        }
      }
      this.expect('OP', ']');
      const list: ListLiteral = { kind: 'List', elements, pos };
      return list;
    }

    if (t.kind === 'OP' && t.value === '(') {
      this.advance();
      const expr = this.parseExpr();
      this.expect('OP', ')');
      return expr;
    }

    throw new ParseError(
      `式の開始として不正なトークン: '${t.value}' (${t.kind})`,
      t.line, t.col
    );
  }
}
