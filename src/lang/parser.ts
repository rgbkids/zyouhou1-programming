import type {
  AssignmentStatement,
  BinaryExpression,
  BooleanLiteral,
  CallExpression,
  Expression,
  ExpressionStatement,
  ForStatement,
  FunctionDefinition,
  Identifier,
  IfStatement,
  IndexExpression,
  ListLiteral,
  MemberExpression,
  NumericLiteral,
  PrintStatement,
  Program,
  ReturnStatement,
  Statement,
  StringLiteral,
  UnaryExpression,
  WhileStatement,
} from "./ast";
import { tokenize, type Token, type TokenType } from "./tokenizer";

export class ParseError extends Error {
  line: number;
  column: number;

  constructor(message: string, token: Token) {
    super(`${message} at ${token.line}:${token.column}`);
    this.name = "ParseError";
    this.line = token.line;
    this.column = token.column;
  }
}

export function parse(source: string): Program {
  return new Parser(tokenize(source)).parseProgram();
}

class Parser {
  private readonly tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parseProgram(): Program {
    const body: Statement[] = [];
    this.skipNewlines();

    while (!this.check("EOF")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    return { type: "Program", body };
  }

  private parseStatement(): Statement {
    if (this.match("IF")) {
      return this.finishIfStatement();
    }
    if (this.match("FOR")) {
      return this.finishForStatement();
    }
    if (this.match("WHILE")) {
      return this.finishWhileStatement();
    }
    if (this.match("DEF")) {
      return this.finishFunctionDefinition();
    }
    return this.parseSimpleStatement();
  }

  private parseSimpleStatement(): Statement {
    if (this.match("PRINT")) {
      const statement = this.finishPrintStatement();
      this.consume("NEWLINE", "Expected newline after print statement");
      return statement;
    }

    if (this.match("RETURN")) {
      const statement: ReturnStatement = {
        type: "ReturnStatement",
        value: this.parseExpression(),
      };
      this.consume("NEWLINE", "Expected newline after return statement");
      return statement;
    }

    if (this.check("IDENT") && this.peekNext().type === "ASSIGN") {
      const name = this.consumeIdentifier("Expected assignment target");
      this.consume("ASSIGN", "Expected '=' in assignment");
      const statement: AssignmentStatement = {
        type: "AssignmentStatement",
        target: name,
        value: this.parseExpression(),
      };
      this.consume("NEWLINE", "Expected newline after assignment");
      return statement;
    }

    const statement: ExpressionStatement = {
      type: "ExpressionStatement",
      expression: this.parseExpression(),
    };
    this.consume("NEWLINE", "Expected newline after expression");
    return statement;
  }

  private finishPrintStatement(): PrintStatement {
    this.consume("LPAREN", "Expected '(' after print");
    const args = this.check("RPAREN") ? [] : this.parseExpressionList();
    this.consume("RPAREN", "Expected ')' after print arguments");
    return { type: "PrintStatement", arguments: args };
  }

  private finishIfStatement(): IfStatement {
    const condition = this.parseExpression();
    this.consume("COLON", "Expected ':' after if condition");
    const thenBranch = this.parseBlock();
    let elseBranch: Statement[] | null = null;

    if (this.match("ELSE")) {
      this.consume("COLON", "Expected ':' after else");
      elseBranch = this.parseBlock();
    }

    return { type: "IfStatement", condition, thenBranch, elseBranch };
  }

  private finishForStatement(): ForStatement {
    const iterator = this.consumeIdentifier("Expected loop variable");
    this.consume("IN", "Expected 'in' after loop variable");
    const iterable = this.parseRangeCall();
    this.consume("COLON", "Expected ':' after for clause");
    const body = this.parseBlock();
    return { type: "ForStatement", iterator, iterable, body };
  }

  private finishWhileStatement(): WhileStatement {
    const condition = this.parseExpression();
    this.consume("COLON", "Expected ':' after while condition");
    const body = this.parseBlock();
    return { type: "WhileStatement", condition, body };
  }

  private finishFunctionDefinition(): FunctionDefinition {
    const name = this.consumeIdentifier("Expected function name");
    this.consume("LPAREN", "Expected '(' after function name");
    const parameters: Identifier[] = [];
    if (!this.check("RPAREN")) {
      do {
        parameters.push(this.consumeIdentifier("Expected parameter name"));
      } while (this.match("COMMA"));
    }
    this.consume("RPAREN", "Expected ')' after parameter list");
    this.consume("COLON", "Expected ':' after function signature");
    const body = this.parseBlock();
    return { type: "FunctionDefinition", name, parameters, body };
  }

  private parseBlock(): Statement[] {
    this.consume("NEWLINE", "Expected newline before block");
    this.consume("INDENT", "Expected indented block");
    const body: Statement[] = [];
    this.skipNewlines();

    while (!this.check("DEDENT") && !this.check("EOF")) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    this.consume("DEDENT", "Expected block to end");
    return body;
  }

  private parseRangeCall(): CallExpression {
    if (!this.match("IDENT") || this.previous().value !== "range") {
      throw new ParseError("Expected range(start, stop, step)", this.peek());
    }

    this.consume("LPAREN", "Expected '(' after range");
    const args = this.parseExpressionList();
    this.consume("RPAREN", "Expected ')' after range arguments");

    if (args.length !== 3) {
      throw new ParseError("range requires exactly 3 arguments", this.previous());
    }

    return {
      type: "CallExpression",
      callee: { type: "Identifier", name: "range" },
      arguments: args,
    };
  }

  private parseExpressionList(): Expression[] {
    const args = [this.parseExpression()];
    while (this.match("COMMA")) {
      args.push(this.parseExpression());
    }
    return args;
  }

  private parseExpression(): Expression {
    return this.parseNot();
  }

  private parseNot(): Expression {
    if (this.match("NOT")) {
      const expression: UnaryExpression = {
        type: "UnaryExpression",
        operator: "not",
        argument: this.parseNot(),
      };
      return expression;
    }
    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let expr = this.parseAdditive();

    while (this.match("EQ", "NE", "LT", "LE", "GT", "GE")) {
      const operator = tokenToOperator(this.previous());
      const expression: BinaryExpression = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right: this.parseAdditive(),
      };
      expr = expression;
    }

    return expr;
  }

  private parseAdditive(): Expression {
    let expr = this.parseMultiplicative();

    while (this.match("PLUS", "MINUS")) {
      const operator = tokenToOperator(this.previous());
      const expression: BinaryExpression = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right: this.parseMultiplicative(),
      };
      expr = expression;
    }

    return expr;
  }

  private parseMultiplicative(): Expression {
    let expr = this.parseUnary();

    while (this.match("STAR", "SLASH", "PERCENT")) {
      const operator = tokenToOperator(this.previous());
      const expression: BinaryExpression = {
        type: "BinaryExpression",
        operator,
        left: expr,
        right: this.parseUnary(),
      };
      expr = expression;
    }

    return expr;
  }

  private parseUnary(): Expression {
    if (this.match("MINUS")) {
      const expression: UnaryExpression = {
        type: "UnaryExpression",
        operator: "-",
        argument: this.parseUnary(),
      };
      return expression;
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match("LPAREN")) {
        const args = this.check("RPAREN") ? [] : this.parseExpressionList();
        this.consume("RPAREN", "Expected ')' after arguments");
        const call: CallExpression = {
          type: "CallExpression",
          callee: expr,
          arguments: args,
        };
        expr = call;
        continue;
      }

      if (this.match("LBRACKET")) {
        const index = this.parseExpression();
        this.consume("RBRACKET", "Expected ']' after index");
        const access: IndexExpression = {
          type: "IndexExpression",
          target: expr,
          index,
        };
        expr = access;
        continue;
      }

      if (this.match("DOT")) {
        const member: MemberExpression = {
          type: "MemberExpression",
          object: expr,
          property: this.consumeIdentifier("Expected property name after '.'"),
        };
        expr = member;
        continue;
      }

      return expr;
    }
  }

  private parsePrimary(): Expression {
    if (this.match("NUMBER")) {
      const token = this.previous();
      const literal: NumericLiteral = {
        type: "NumericLiteral",
        value: Number(token.value),
        raw: token.value ?? "",
      };
      return literal;
    }

    if (this.match("STRING")) {
      const literal: StringLiteral = {
        type: "StringLiteral",
        value: this.previous().value ?? "",
      };
      return literal;
    }

    if (this.match("TRUE", "FALSE")) {
      const literal: BooleanLiteral = {
        type: "BooleanLiteral",
        value: this.previous().type === "TRUE",
      };
      return literal;
    }

    if (this.match("IDENT")) {
      return { type: "Identifier", name: this.previous().value ?? "" };
    }

    if (this.match("LBRACKET")) {
      const elements = this.check("RBRACKET") ? [] : this.parseExpressionList();
      this.consume("RBRACKET", "Expected ']' after list literal");
      const list: ListLiteral = { type: "ListLiteral", elements };
      return list;
    }

    if (this.match("LPAREN")) {
      const expr = this.parseExpression();
      this.consume("RPAREN", "Expected ')' after expression");
      return expr;
    }

    throw new ParseError("Expected expression", this.peek());
  }

  private skipNewlines() {
    while (this.match("NEWLINE")) {
      continue;
    }
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance();
    }
    throw new ParseError(message, this.peek());
  }

  private consumeIdentifier(message: string): Identifier {
    const token = this.consume("IDENT", message);
    return { type: "Identifier", name: token.value ?? "" };
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return type === "EOF";
    }
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1;
    }
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token {
    return this.tokens[this.current + 1] ?? this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }
}

function tokenToOperator(token: Token): BinaryExpression["operator"] {
  switch (token.type) {
    case "PLUS":
      return "+";
    case "MINUS":
      return "-";
    case "STAR":
      return "*";
    case "SLASH":
      return "/";
    case "PERCENT":
      return "%";
    case "EQ":
      return "==";
    case "NE":
      return "!=";
    case "LT":
      return "<";
    case "LE":
      return "<=";
    case "GT":
      return ">";
    case "GE":
      return ">=";
    default:
      throw new Error(`Unsupported operator token: ${token.type}`);
  }
}
