// Recursive-descent parser for the Jouhou-I language subset

import type { Token } from './tokenizer';
import type {
  Program, Stmt, Expr,
  AssignStmt, PrintStmt, IfStmt, ForStmt, WhileStmt, DefStmt, ReturnStmt, ExprStmt,
  BinOp, UnaryOp, Compare, BoolOp,
  ListLiteral, IndexAccess, FuncCall, AttributeAccess,
} from './ast';

export class ParseError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col: number) {
    super(`ParseError at line ${line}: ${message}`);
    this.line = line;
    this.col = col;
  }
}

export function parse(tokens: Token[]): Program {
  let pos = 0;

  function peek(): Token { return tokens[pos]; }
  function advance(): Token { return tokens[pos++]; }

  function expect(type: Token['type'], value?: string): Token {
    const tok = peek();
    if (tok.type !== type || (value !== undefined && tok.value !== value)) {
      throw new ParseError(
        `Expected ${value ?? type}, got '${tok.value}' (${tok.type})`,
        tok.line, tok.col,
      );
    }
    return advance();
  }

  function skipNewlines() {
    while (peek().type === 'NEWLINE') advance();
  }

  function parseBlock(): Stmt[] {
    expect('INDENT');
    const stmts: Stmt[] = [];
    skipNewlines();
    while (peek().type !== 'DEDENT' && peek().type !== 'EOF') {
      stmts.push(parseStmt());
      skipNewlines();
    }
    if (peek().type === 'DEDENT') advance();
    return stmts;
  }

  function parseStmt(): Stmt {
    const tok = peek();

    if (tok.type === 'KEYWORD') {
      if (tok.value === 'if') return parseIf();
      if (tok.value === 'for') return parseFor();
      if (tok.value === 'while') return parseWhile();
      if (tok.value === 'def') return parseDef();
      if (tok.value === 'return') return parseReturn();
    }

    // Assignment or expression statement
    return parseAssignOrExpr();
  }

  function parseAssignOrExpr(): AssignStmt | ExprStmt | PrintStmt {
    const line = peek().line;

    // print statement sugar: treat print(...) as PrintStmt
    if (peek().type === 'IDENT' && peek().value === 'print') {
      const printTok = advance();
      if (peek().type === 'LPAREN') {
        advance(); // (
        const args: Expr[] = [];
        if (peek().type !== 'RPAREN') {
          args.push(parseExpr());
          while (peek().type === 'COMMA') { advance(); args.push(parseExpr()); }
        }
        expect('RPAREN');
        consumeNewline();
        return { type: 'PrintStmt', args, line: printTok.line };
      }
      // fallback: treat 'print' as identifier
      pos--; // put print back
    }

    const expr = parseExpr();

    // Check for assignment: name = value  OR  name[idx] = value
    if (peek().type === 'ASSIGN') {
      advance(); // =
      const value = parseExpr();
      consumeNewline();
      if (expr.type === 'Identifier') {
        return { type: 'AssignStmt', target: expr.name, value, line };
      }
      // Index assignment: treated as ExprStmt wrapping a special node — not in AST types,
      // so we encode as a special FuncCall-like ExprStmt for the evaluator to handle.
      if (expr.type === 'IndexAccess') {
        // Encode as __setitem__(target, index, value)
        const setItem: FuncCall = {
          type: 'FuncCall',
          callee: { type: 'Identifier', name: '__setitem__', line },
          args: [expr.target, expr.index, value],
          line,
        };
        return { type: 'ExprStmt', expr: setItem, line };
      }
      throw new ParseError(`Invalid assignment target`, line, 0);
    }

    consumeNewline();
    return { type: 'ExprStmt', expr, line };
  }

  function consumeNewline() {
    if (peek().type === 'NEWLINE') advance();
  }

  function parseIf(): IfStmt {
    const line = peek().line;
    expect('KEYWORD', 'if');
    const test = parseExpr();
    expect('COLON');
    consumeNewline();
    const body = parseBlock();
    let orelse: Stmt[] = [];
    if (peek().type === 'KEYWORD' && peek().value === 'else') {
      advance();
      expect('COLON');
      consumeNewline();
      orelse = parseBlock();
    } else if (peek().type === 'KEYWORD' && peek().value === 'elif') {
      orelse = [parseIf()];
    }
    return { type: 'IfStmt', test, body, orelse, line };
  }

  function parseFor(): ForStmt {
    const line = peek().line;
    expect('KEYWORD', 'for');
    const target = expect('IDENT').value;
    expect('KEYWORD', 'in');
    const iter = parseExpr();
    expect('COLON');
    consumeNewline();
    const body = parseBlock();
    return { type: 'ForStmt', target, iter, body, line };
  }

  function parseWhile(): WhileStmt {
    const line = peek().line;
    expect('KEYWORD', 'while');
    const test = parseExpr();
    expect('COLON');
    consumeNewline();
    const body = parseBlock();
    return { type: 'WhileStmt', test, body, line };
  }

  function parseDef(): DefStmt {
    const line = peek().line;
    expect('KEYWORD', 'def');
    const name = expect('IDENT').value;
    expect('LPAREN');
    const params: string[] = [];
    if (peek().type !== 'RPAREN') {
      params.push(expect('IDENT').value);
      while (peek().type === 'COMMA') { advance(); params.push(expect('IDENT').value); }
    }
    expect('RPAREN');
    expect('COLON');
    consumeNewline();
    const body = parseBlock();
    return { type: 'DefStmt', name, params, body, line };
  }

  function parseReturn(): ReturnStmt {
    const line = peek().line;
    expect('KEYWORD', 'return');
    let value: Expr | null = null;
    if (peek().type !== 'NEWLINE' && peek().type !== 'EOF' && peek().type !== 'DEDENT') {
      value = parseExpr();
    }
    consumeNewline();
    return { type: 'ReturnStmt', value, line };
  }

  // Expression parsing with precedence climbing

  function parseExpr(): Expr { return parseBoolOp(); }

  function parseBoolOp(): Expr {
    let left = parseNot();
    while (peek().type === 'KEYWORD' && (peek().value === 'and' || peek().value === 'or')) {
      const op = advance().value as 'and' | 'or';
      const right = parseNot();
      left = { type: 'BoolOp', op, left, right, line: left.line } as BoolOp;
    }
    return left;
  }

  function parseNot(): Expr {
    if (peek().type === 'KEYWORD' && peek().value === 'not') {
      const line = peek().line;
      advance();
      const operand = parseNot();
      return { type: 'UnaryOp', op: 'not', operand, line } as UnaryOp;
    }
    return parseComparison();
  }

  function parseComparison(): Expr {
    let left = parseAddSub();
    while (peek().type === 'COMPARE') {
      const op = advance().value as Compare['op'];
      const right = parseAddSub();
      left = { type: 'Compare', op, left, right, line: left.line } as Compare;
    }
    return left;
  }

  function parseAddSub(): Expr {
    let left = parseMulDiv();
    while (peek().type === 'OP' && (peek().value === '+' || peek().value === '-')) {
      const op = advance().value as '+' | '-';
      const right = parseMulDiv();
      left = { type: 'BinOp', op, left, right, line: left.line } as BinOp;
    }
    return left;
  }

  function parseMulDiv(): Expr {
    let left = parseUnary();
    while (peek().type === 'OP' && (peek().value === '*' || peek().value === '/' || peek().value === '//' || peek().value === '%' || peek().value === '**')) {
      const op = advance().value as BinOp['op'];
      const right = parseUnary();
      left = { type: 'BinOp', op, left, right, line: left.line } as BinOp;
    }
    return left;
  }

  function parseUnary(): Expr {
    if (peek().type === 'OP' && peek().value === '-') {
      const line = peek().line;
      advance();
      const operand = parseUnary();
      return { type: 'UnaryOp', op: '-', operand, line } as UnaryOp;
    }
    return parsePostfix();
  }

  function parsePostfix(): Expr {
    let expr = parsePrimary();
    while (true) {
      if (peek().type === 'LBRACKET') {
        const line = peek().line;
        advance();
        const index = parseExpr();
        expect('RBRACKET');
        expr = { type: 'IndexAccess', target: expr, index, line } as IndexAccess;
      } else if (peek().type === 'DOT') {
        const line = peek().line;
        advance();
        const attr = expect('IDENT').value;
        expr = { type: 'AttributeAccess', object: expr, attr, line } as AttributeAccess;
      } else if (peek().type === 'LPAREN') {
        const line = peek().line;
        advance();
        const args: Expr[] = [];
        if (peek().type !== 'RPAREN') {
          args.push(parseExpr());
          while (peek().type === 'COMMA') { advance(); args.push(parseExpr()); }
        }
        expect('RPAREN');
        expr = { type: 'FuncCall', callee: expr, args, line } as FuncCall;
      } else {
        break;
      }
    }
    return expr;
  }

  function parsePrimary(): Expr {
    const tok = peek();

    if (tok.type === 'NUMBER') {
      advance();
      return { type: 'NumberLiteral', value: parseFloat(tok.value), line: tok.line };
    }
    if (tok.type === 'STRING') {
      advance();
      return { type: 'StringLiteral', value: tok.value, line: tok.line };
    }
    if (tok.type === 'KEYWORD' && tok.value === 'True') {
      advance();
      return { type: 'BoolLiteral', value: true, line: tok.line };
    }
    if (tok.type === 'KEYWORD' && tok.value === 'False') {
      advance();
      return { type: 'BoolLiteral', value: false, line: tok.line };
    }
    if (tok.type === 'KEYWORD' && tok.value === 'None') {
      advance();
      return { type: 'NoneLiteral', line: tok.line };
    }
    if (tok.type === 'IDENT') {
      advance();
      return { type: 'Identifier', name: tok.value, line: tok.line };
    }
    if (tok.type === 'LPAREN') {
      advance();
      const expr = parseExpr();
      expect('RPAREN');
      return expr;
    }
    if (tok.type === 'LBRACKET') {
      const line = tok.line;
      advance();
      const elements: Expr[] = [];
      if (peek().type !== 'RBRACKET') {
        elements.push(parseExpr());
        while (peek().type === 'COMMA') {
          advance();
          if (peek().type === 'RBRACKET') break;
          elements.push(parseExpr());
        }
      }
      expect('RBRACKET');
      return { type: 'ListLiteral', elements, line } as ListLiteral;
    }

    throw new ParseError(`Unexpected token '${tok.value}' (${tok.type})`, tok.line, tok.col);
  }

  // --- Parse top-level ---
  skipNewlines();
  const body: Stmt[] = [];
  while (peek().type !== 'EOF') {
    body.push(parseStmt());
    skipNewlines();
  }
  return { type: 'Program', body };
}
