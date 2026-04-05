// Recursive descent parser for info1 language

import { tokenize, Token, TokenizeError } from "./tokenizer";
import type { Pos, Expr, Stmt, Program, BinOp, ElifClause } from "./ast";

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly col: number,
  ) {
    super(`行 ${line}, 列 ${col}: ${message}`);
    this.name = "ParseError";
  }
}

export { TokenizeError };

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private peek(): Token { return this.tokens[this.pos]; }

  private advance(): Token { return this.tokens[this.pos++]; }

  private check(kind: string, value?: string): boolean {
    const t = this.peek();
    return t.kind === kind && (value === undefined || t.value === value);
  }

  private match(kind: string, value?: string): boolean {
    if (this.check(kind, value)) { this.advance(); return true; }
    return false;
  }

  private expect(kind: string, value?: string): Token {
    if (this.check(kind, value)) return this.advance();
    const t = this.peek();
    const expected = value !== undefined ? `"${value}"` : kind;
    throw new ParseError(`${expected} が必要です（"${t.value}" が来ました）`, t.line, t.col);
  }

  private currentPos(): Pos {
    const t = this.peek();
    return { line: t.line, col: t.col };
  }

  private skipNewlines(): void {
    while (this.check("NEWLINE")) this.advance();
  }

  // ─── Program ───────────────────────────────────────────────────────────────

  parseProgram(): Program {
    this.skipNewlines();
    const stmts: Stmt[] = [];
    while (!this.check("EOF")) {
      const stmt = this.parseStmt();
      if (stmt) stmts.push(stmt);
      this.skipNewlines();
    }
    return { stmts };
  }

  // ─── Statements ────────────────────────────────────────────────────────────

  private parseStmt(): Stmt {
    const t = this.peek();

    if (t.kind === "NAME") {
      switch (t.value) {
        case "if":       return this.parseIf();
        case "for":      return this.parseFor();
        case "while":    return this.parseWhile();
        case "def":      return this.parseDef();
        case "return":   return this.parseReturn();
        case "break":    return this.parseBreak();
        case "continue": return this.parseContinue();
        case "pass":     return this.parsePass();
        default:         return this.parseAssignOrExpr();
      }
    }
    return this.parseAssignOrExpr();
  }

  private parseAssignOrExpr(): Stmt {
    const pos = this.currentPos();
    const expr = this.parseExpr();

    // Check for assignment: NAME = expr  or  expr[idx] = expr
    if (this.check("ASSIGN")) {
      this.advance(); // consume "="
      const value = this.parseExpr();
      this.expectNewline();
      if (expr.kind === "name") {
        return { kind: "assign", target: expr.name, value, pos };
      }
      if (expr.kind === "index") {
        return { kind: "index_assign", obj: expr.obj, idx: expr.idx, value, pos };
      }
      throw new ParseError("代入の左辺が正しくありません", pos.line, pos.col);
    }

    this.expectNewline();
    return { kind: "expr_stmt", expr, pos };
  }

  private expectNewline(): void {
    if (this.check("EOF")) return;
    if (this.check("DEDENT")) return;
    this.expect("NEWLINE");
  }

  private parseBlock(): Stmt[] {
    this.expect("INDENT");
    this.skipNewlines();
    const stmts: Stmt[] = [];
    while (!this.check("DEDENT") && !this.check("EOF")) {
      const stmt = this.parseStmt();
      if (stmt) stmts.push(stmt);
      this.skipNewlines();
    }
    if (this.check("DEDENT")) this.advance();
    if (stmts.length === 0) {
      const t = this.peek();
      throw new ParseError("ブロックが空です（pass を使ってください）", t.line, t.col);
    }
    return stmts;
  }

  private parseIf(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "if");
    const cond = this.parseExpr();
    this.expect("COLON");
    this.expect("NEWLINE");
    const then = this.parseBlock();

    const elifs: ElifClause[] = [];
    while (this.check("NAME", "elif")) {
      this.advance();
      const elifCond = this.parseExpr();
      this.expect("COLON");
      this.expect("NEWLINE");
      const elifBody = this.parseBlock();
      elifs.push({ cond: elifCond, body: elifBody });
    }

    let else_: Stmt[] = [];
    if (this.check("NAME", "else")) {
      this.advance();
      this.expect("COLON");
      this.expect("NEWLINE");
      else_ = this.parseBlock();
    }

    return { kind: "if", cond, then, elifs, else_, pos };
  }

  private parseFor(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "for");
    const varToken = this.expect("NAME");
    if (["if","else","elif","for","in","while","def","return","break","continue","pass","True","False","None","and","or","not"].includes(varToken.value)) {
      throw new ParseError(`"${varToken.value}" はキーワードのため変数名に使えません`, varToken.line, varToken.col);
    }
    this.expect("NAME", "in");
    const iter = this.parseExpr();
    this.expect("COLON");
    this.expect("NEWLINE");
    const body = this.parseBlock();
    return { kind: "for", var_: varToken.value, iter, body, pos };
  }

  private parseWhile(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "while");
    const cond = this.parseExpr();
    this.expect("COLON");
    this.expect("NEWLINE");
    const body = this.parseBlock();
    return { kind: "while", cond, body, pos };
  }

  private parseDef(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "def");
    const nameToken = this.expect("NAME");
    this.expect("LPAREN");
    const params: string[] = [];
    if (!this.check("RPAREN")) {
      params.push(this.expect("NAME").value);
      while (this.match("COMMA")) {
        if (this.check("RPAREN")) break;
        params.push(this.expect("NAME").value);
      }
    }
    this.expect("RPAREN");
    this.expect("COLON");
    this.expect("NEWLINE");
    const body = this.parseBlock();
    return { kind: "def", name: nameToken.value, params, body, pos };
  }

  private parseReturn(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "return");
    if (this.check("NEWLINE") || this.check("EOF") || this.check("DEDENT")) {
      this.skipNewlines();
      return { kind: "return", value: null, pos };
    }
    const value = this.parseExpr();
    this.expectNewline();
    return { kind: "return", value, pos };
  }

  private parseBreak(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "break");
    this.expectNewline();
    return { kind: "break", pos };
  }

  private parseContinue(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "continue");
    this.expectNewline();
    return { kind: "continue", pos };
  }

  private parsePass(): Stmt {
    const pos = this.currentPos();
    this.expect("NAME", "pass");
    this.expectNewline();
    return { kind: "pass", pos };
  }

  // ─── Expressions ───────────────────────────────────────────────────────────

  private parseExpr(): Expr {
    return this.parseOr();
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.check("NAME", "or")) {
      const pos = this.currentPos();
      this.advance();
      const right = this.parseAnd();
      left = { kind: "binop", op: "or", left, right, pos };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseNot();
    while (this.check("NAME", "and")) {
      const pos = this.currentPos();
      this.advance();
      const right = this.parseNot();
      left = { kind: "binop", op: "and", left, right, pos };
    }
    return left;
  }

  private parseNot(): Expr {
    if (this.check("NAME", "not")) {
      const pos = this.currentPos();
      this.advance();
      const operand = this.parseNot();
      return { kind: "unop", op: "not", operand, pos };
    }
    return this.parseCmp();
  }

  private parseCmp(): Expr {
    let left = this.parseAdd();
    while (true) {
      const t = this.peek();
      let op: BinOp | null = null;
      if (t.kind === "EQ")  op = "==";
      else if (t.kind === "NEQ") op = "!=";
      else if (t.kind === "LT")  op = "<";
      else if (t.kind === "LE")  op = "<=";
      else if (t.kind === "GT")  op = ">";
      else if (t.kind === "GE")  op = ">=";
      if (!op) break;
      const pos = this.currentPos();
      this.advance();
      const right = this.parseAdd();
      left = { kind: "binop", op, left, right, pos };
    }
    return left;
  }

  private parseAdd(): Expr {
    let left = this.parseMul();
    while (this.check("PLUS") || this.check("MINUS")) {
      const pos = this.currentPos();
      const op: BinOp = this.advance().kind === "PLUS" ? "+" : "-";
      const right = this.parseMul();
      left = { kind: "binop", op, left, right, pos };
    }
    return left;
  }

  private parseMul(): Expr {
    let left = this.parsePow();
    while (this.check("STAR") || this.check("SLASH") || this.check("DSLASH") || this.check("PERCENT")) {
      const pos = this.currentPos();
      const k = this.advance().kind;
      const op: BinOp = k === "STAR" ? "*" : k === "SLASH" ? "/" : k === "DSLASH" ? "//" : "%";
      const right = this.parsePow();
      left = { kind: "binop", op, left, right, pos };
    }
    return left;
  }

  private parsePow(): Expr {
    const base = this.parseUnary();
    if (this.check("DSTAR")) {
      const pos = this.currentPos();
      this.advance();
      const exp = this.parseUnary(); // right-assoc: a**b**c = a**(b**c), but here we do single level
      return { kind: "binop", op: "**", left: base, right: exp, pos };
    }
    return base;
  }

  private parseUnary(): Expr {
    if (this.check("MINUS")) {
      const pos = this.currentPos();
      this.advance();
      const operand = this.parseUnary();
      return { kind: "unop", op: "neg", operand, pos };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    let expr = this.parseAtom();

    // Suffixes: [idx], (args), .attr
    while (true) {
      if (this.check("LBRACKET")) {
        const pos = this.currentPos();
        this.advance();
        const idx = this.parseExpr();
        this.expect("RBRACKET");
        expr = { kind: "index", obj: expr, idx, pos };
      } else if (this.check("LPAREN")) {
        const pos = this.currentPos();
        this.advance();
        const args: Expr[] = [];
        if (!this.check("RPAREN")) {
          args.push(this.parseExpr());
          while (this.match("COMMA")) {
            if (this.check("RPAREN")) break;
            args.push(this.parseExpr());
          }
        }
        this.expect("RPAREN");
        expr = { kind: "call", func: expr, args, pos };
      } else if (this.check("DOT")) {
        const pos = this.currentPos();
        this.advance();
        const attr = this.expect("NAME").value;
        expr = { kind: "attr", obj: expr, attr, pos };
      } else {
        break;
      }
    }

    return expr;
  }

  private parseAtom(): Expr {
    const t = this.peek();
    const pos: Pos = { line: t.line, col: t.col };

    if (t.kind === "NUMBER") {
      this.advance();
      return { kind: "number", value: parseFloat(t.value), pos };
    }

    if (t.kind === "STRING") {
      this.advance();
      return { kind: "string", value: t.value, pos };
    }

    if (t.kind === "NAME") {
      switch (t.value) {
        case "True":  this.advance(); return { kind: "bool", value: true, pos };
        case "False": this.advance(); return { kind: "bool", value: false, pos };
        case "None":  this.advance(); return { kind: "none", pos };
        default:
          this.advance();
          return { kind: "name", name: t.value, pos };
      }
    }

    if (t.kind === "LPAREN") {
      this.advance();
      const inner = this.parseExpr();
      this.expect("RPAREN");
      return inner;
    }

    if (t.kind === "LBRACKET") {
      this.advance();
      const items: Expr[] = [];
      if (!this.check("RBRACKET")) {
        items.push(this.parseExpr());
        while (this.match("COMMA")) {
          if (this.check("RBRACKET")) break;
          items.push(this.parseExpr());
        }
      }
      this.expect("RBRACKET");
      return { kind: "list", items, pos };
    }

    throw new ParseError(`予期しないトークン: "${t.value}"`, t.line, t.col);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function parse(source: string): Program {
  const tokens = tokenize(source);
  const parser = new Parser(tokens);
  return parser.parseProgram();
}
