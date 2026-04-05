export type TokenType =
  | "IDENT"
  | "NUMBER"
  | "STRING"
  | "NEWLINE"
  | "INDENT"
  | "DEDENT"
  | "EOF"
  | "ASSIGN"
  | "LPAREN"
  | "RPAREN"
  | "LBRACKET"
  | "RBRACKET"
  | "COMMA"
  | "COLON"
  | "DOT"
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "PERCENT"
  | "EQ"
  | "NE"
  | "LT"
  | "LE"
  | "GT"
  | "GE"
  | "IF"
  | "ELSE"
  | "FOR"
  | "IN"
  | "WHILE"
  | "DEF"
  | "RETURN"
  | "PRINT"
  | "NOT"
  | "TRUE"
  | "FALSE";

export type Token = {
  type: TokenType;
  value?: string;
  line: number;
  column: number;
};

const KEYWORDS: Record<string, TokenType> = {
  def: "DEF",
  else: "ELSE",
  false: "FALSE",
  for: "FOR",
  if: "IF",
  in: "IN",
  not: "NOT",
  print: "PRINT",
  return: "RETURN",
  true: "TRUE",
  while: "WHILE",
};

export class TokenizeError extends Error {
  line: number;
  column: number;

  constructor(message: string, line: number, column: number) {
    super(`${message} at ${line}:${column}`);
    this.name = "TokenizeError";
    this.line = line;
    this.column = column;
  }
}

export function tokenize(source: string): Token[] {
  const normalized = source.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const tokens: Token[] = [];
  const indentStack = [0];

  lines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    const indentMatch = lineText.match(/^[ \t]*/);
    const indentText = indentMatch ? indentMatch[0] : "";
    const content = lineText.slice(indentText.length);

    if (content.trim() === "" || content.trimStart().startsWith("#")) {
      tokens.push({ type: "NEWLINE", line: lineNumber, column: lineText.length + 1 });
      return;
    }

    if (indentText.includes("\t")) {
      throw new TokenizeError("Tabs are not allowed for indentation", lineNumber, 1);
    }

    const indent = indentText.length;
    const currentIndent = indentStack[indentStack.length - 1];

    if (indent > currentIndent) {
      indentStack.push(indent);
      tokens.push({ type: "INDENT", line: lineNumber, column: 1 });
    } else if (indent < currentIndent) {
      while (indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        tokens.push({ type: "DEDENT", line: lineNumber, column: 1 });
      }
      if (indent !== indentStack[indentStack.length - 1]) {
        throw new TokenizeError("Inconsistent indentation", lineNumber, 1);
      }
    }

    scanContent(content, lineNumber, indent + 1, tokens);
    tokens.push({ type: "NEWLINE", line: lineNumber, column: lineText.length + 1 });
  });

  while (indentStack.length > 1) {
    indentStack.pop();
    tokens.push({ type: "DEDENT", line: lines.length, column: 1 });
  }

  tokens.push({ type: "EOF", line: lines.length, column: 1 });
  return tokens;
}

function scanContent(content: string, line: number, startColumn: number, tokens: Token[]) {
  let index = 0;

  while (index < content.length) {
    const column = startColumn + index;
    const char = content[index];

    if (char === " " || char === "\t") {
      index += 1;
      continue;
    }

    if (char === "#") {
      return;
    }

    if (isIdentifierStart(char)) {
      const start = index;
      index += 1;
      while (index < content.length && isIdentifierPart(content[index])) {
        index += 1;
      }
      const value = content.slice(start, index);
      tokens.push({
        type: KEYWORDS[value] ?? "IDENT",
        value,
        line,
        column,
      });
      continue;
    }

    if (isDigit(char)) {
      const start = index;
      index += 1;
      while (index < content.length && isDigit(content[index])) {
        index += 1;
      }
      if (content[index] === "." && isDigit(content[index + 1] ?? "")) {
        index += 1;
        while (index < content.length && isDigit(content[index])) {
          index += 1;
        }
      }
      tokens.push({
        type: "NUMBER",
        value: content.slice(start, index),
        line,
        column,
      });
      continue;
    }

    if (char === "\"") {
      let value = "";
      index += 1;
      while (index < content.length && content[index] !== "\"") {
        if (content[index] === "\\") {
          const escaped = content[index + 1];
          if (escaped === undefined) {
            throw new TokenizeError("Unterminated string literal", line, column);
          }
          value += decodeEscape(escaped);
          index += 2;
          continue;
        }
        value += content[index];
        index += 1;
      }
      if (content[index] !== "\"") {
        throw new TokenizeError("Unterminated string literal", line, column);
      }
      index += 1;
      tokens.push({ type: "STRING", value, line, column });
      continue;
    }

    const twoChar = content.slice(index, index + 2);
    if (twoChar === "==") {
      tokens.push({ type: "EQ", line, column });
      index += 2;
      continue;
    }
    if (twoChar === "!=") {
      tokens.push({ type: "NE", line, column });
      index += 2;
      continue;
    }
    if (twoChar === "<=") {
      tokens.push({ type: "LE", line, column });
      index += 2;
      continue;
    }
    if (twoChar === ">=") {
      tokens.push({ type: "GE", line, column });
      index += 2;
      continue;
    }

    switch (char) {
      case "=":
        tokens.push({ type: "ASSIGN", line, column });
        break;
      case "(":
        tokens.push({ type: "LPAREN", line, column });
        break;
      case ")":
        tokens.push({ type: "RPAREN", line, column });
        break;
      case "[":
        tokens.push({ type: "LBRACKET", line, column });
        break;
      case "]":
        tokens.push({ type: "RBRACKET", line, column });
        break;
      case ",":
        tokens.push({ type: "COMMA", line, column });
        break;
      case ":":
        tokens.push({ type: "COLON", line, column });
        break;
      case ".":
        tokens.push({ type: "DOT", line, column });
        break;
      case "+":
        tokens.push({ type: "PLUS", line, column });
        break;
      case "-":
        tokens.push({ type: "MINUS", line, column });
        break;
      case "*":
        tokens.push({ type: "STAR", line, column });
        break;
      case "/":
        tokens.push({ type: "SLASH", line, column });
        break;
      case "%":
        tokens.push({ type: "PERCENT", line, column });
        break;
      case "<":
        tokens.push({ type: "LT", line, column });
        break;
      case ">":
        tokens.push({ type: "GT", line, column });
        break;
      default:
        throw new TokenizeError(`Unexpected character '${char}'`, line, column);
    }
    index += 1;
  }
}

function decodeEscape(char: string): string {
  switch (char) {
    case "\"":
      return "\"";
    case "\\":
      return "\\";
    case "n":
      return "\n";
    case "t":
      return "\t";
    default:
      return char;
  }
}

function isIdentifierStart(char: string): boolean {
  return /[A-Za-z_]/.test(char);
}

function isIdentifierPart(char: string): boolean {
  return /[A-Za-z0-9_]/.test(char);
}

function isDigit(char: string): boolean {
  return /[0-9]/.test(char);
}
