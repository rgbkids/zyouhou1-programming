// Tokenizer for info1 language
// Uses indentation-based block structure (Python-style INDENT/DEDENT)

export type TokenKind =
  | "NUMBER" | "STRING" | "NAME"
  | "PLUS" | "MINUS" | "STAR" | "SLASH" | "DSLASH" | "PERCENT" | "DSTAR"
  | "EQ" | "NEQ" | "LT" | "LE" | "GT" | "GE"
  | "ASSIGN"
  | "LPAREN" | "RPAREN" | "LBRACKET" | "RBRACKET"
  | "COMMA" | "COLON" | "DOT"
  | "NEWLINE" | "INDENT" | "DEDENT"
  | "EOF";

export interface Token {
  kind: TokenKind;
  value: string;
  line: number;
  col: number;
}

export class TokenizeError extends Error {
  constructor(
    message: string,
    public readonly line: number,
    public readonly col: number,
  ) {
    super(`行 ${line}, 列 ${col}: ${message}`);
    this.name = "TokenizeError";
  }
}

const KEYWORDS = new Set([
  "if", "elif", "else",
  "for", "in",
  "while",
  "def", "return",
  "break", "continue", "pass",
  "True", "False", "None",
  "and", "or", "not",
]);

function countIndent(line: string): number {
  let indent = 0;
  for (const ch of line) {
    if (ch === " ")  indent += 1;
    else if (ch === "\t") indent = Math.floor(indent / 4) * 4 + 4;
    else break;
  }
  return indent;
}

export function tokenize(source: string): Token[] {
  // Normalize line endings
  const rawLines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  const tokens: Token[] = [];
  const indentStack = [0];
  let parenDepth = 0;

  function tok(kind: TokenKind, value: string, line: number, col: number): Token {
    return { kind, value, line, col };
  }

  function tokenizeLine(rawLine: string, lineNum: number): void {
    let i = 0;

    // Skip leading whitespace on this line (already handled for indentation)
    while (i < rawLine.length && (rawLine[i] === " " || rawLine[i] === "\t")) i++;

    while (i < rawLine.length) {
      const ch = rawLine[i];
      const colNum = i + 1;

      // Skip inline whitespace
      if (ch === " " || ch === "\t") { i++; continue; }

      // Comment
      if (ch === "#") break;

      // Number
      if (/[0-9]/.test(ch) || (ch === "." && i + 1 < rawLine.length && /[0-9]/.test(rawLine[i + 1]))) {
        let num = "";
        while (i < rawLine.length && /[0-9]/.test(rawLine[i])) num += rawLine[i++];
        if (i < rawLine.length && rawLine[i] === "." && /[0-9]/.test(rawLine[i + 1] ?? "")) {
          num += rawLine[i++];
          while (i < rawLine.length && /[0-9]/.test(rawLine[i])) num += rawLine[i++];
        }
        tokens.push(tok("NUMBER", num, lineNum, colNum));
        continue;
      }

      // String (single or double quote)
      if (ch === '"' || ch === "'") {
        const quote = ch;
        i++;
        let str = "";
        while (i < rawLine.length && rawLine[i] !== quote) {
          if (rawLine[i] === "\\") {
            i++;
            const esc = rawLine[i++] ?? "";
            switch (esc) {
              case "n":  str += "\n"; break;
              case "t":  str += "\t"; break;
              case "\\":  str += "\\"; break;
              case '"':  str += '"';  break;
              case "'":  str += "'";  break;
              default:   str += "\\" + esc;
            }
          } else {
            str += rawLine[i++];
          }
        }
        if (i >= rawLine.length) {
          throw new TokenizeError("文字列が閉じられていません", lineNum, colNum);
        }
        i++; // closing quote
        tokens.push(tok("STRING", str, lineNum, colNum));
        continue;
      }

      // Name or keyword
      if (/[a-zA-Z_]/.test(ch)) {
        let name = "";
        while (i < rawLine.length && /[a-zA-Z0-9_]/.test(rawLine[i])) name += rawLine[i++];
        if (KEYWORDS.has(name)) {
          // Keywords stored as NAME tokens; parser checks the value
          tokens.push(tok("NAME", name, lineNum, colNum));
        } else {
          tokens.push(tok("NAME", name, lineNum, colNum));
        }
        continue;
      }

      // Two-character operators
      const two = rawLine.slice(i, i + 2);
      if (two === "**") { tokens.push(tok("DSTAR",  "**", lineNum, colNum)); i += 2; continue; }
      if (two === "//") { tokens.push(tok("DSLASH", "//", lineNum, colNum)); i += 2; continue; }
      if (two === "==") { tokens.push(tok("EQ",     "==", lineNum, colNum)); i += 2; continue; }
      if (two === "!=") { tokens.push(tok("NEQ",    "!=", lineNum, colNum)); i += 2; continue; }
      if (two === "<=") { tokens.push(tok("LE",     "<=", lineNum, colNum)); i += 2; continue; }
      if (two === ">=") { tokens.push(tok("GE",     ">=", lineNum, colNum)); i += 2; continue; }

      // Single-character operators / delimiters
      switch (ch) {
        case "+": tokens.push(tok("PLUS",     "+", lineNum, colNum)); i++; break;
        case "-": tokens.push(tok("MINUS",    "-", lineNum, colNum)); i++; break;
        case "*": tokens.push(tok("STAR",     "*", lineNum, colNum)); i++; break;
        case "/": tokens.push(tok("SLASH",    "/", lineNum, colNum)); i++; break;
        case "%": tokens.push(tok("PERCENT",  "%", lineNum, colNum)); i++; break;
        case "<": tokens.push(tok("LT",       "<", lineNum, colNum)); i++; break;
        case ">": tokens.push(tok("GT",       ">", lineNum, colNum)); i++; break;
        case "=": tokens.push(tok("ASSIGN",   "=", lineNum, colNum)); i++; break;
        case "(": tokens.push(tok("LPAREN",   "(", lineNum, colNum)); i++; parenDepth++; break;
        case ")": tokens.push(tok("RPAREN",   ")", lineNum, colNum)); i++; parenDepth--; break;
        case "[": tokens.push(tok("LBRACKET", "[", lineNum, colNum)); i++; parenDepth++; break;
        case "]": tokens.push(tok("RBRACKET", "]", lineNum, colNum)); i++; parenDepth--; break;
        case ",": tokens.push(tok("COMMA",    ",", lineNum, colNum)); i++; break;
        case ":": tokens.push(tok("COLON",    ":", lineNum, colNum)); i++; break;
        case ".": tokens.push(tok("DOT",      ".", lineNum, colNum)); i++; break;
        default:
          throw new TokenizeError(`予期しない文字: "${ch}"`, lineNum, colNum);
      }
    }
  }

  for (let lineIdx = 0; lineIdx < rawLines.length; lineIdx++) {
    const rawLine = rawLines[lineIdx];
    const lineNum = lineIdx + 1;

    const stripped = rawLine.trimStart();

    // Skip blank lines and comment-only lines when not inside brackets
    if (!parenDepth && (stripped === "" || stripped.startsWith("#"))) {
      continue;
    }

    // Handle indentation (only at the start of top-level lines)
    if (!parenDepth) {
      const indent = countIndent(rawLine);
      const current = indentStack[indentStack.length - 1];

      if (indent > current) {
        indentStack.push(indent);
        tokens.push(tok("INDENT", "", lineNum, 1));
      } else if (indent < current) {
        while (indentStack.length > 1 && indentStack[indentStack.length - 1] > indent) {
          indentStack.pop();
          tokens.push(tok("DEDENT", "", lineNum, 1));
        }
        if (indentStack[indentStack.length - 1] !== indent) {
          throw new TokenizeError("インデントが正しくありません", lineNum, 1);
        }
      }
    }

    // Tokenize the content of this line
    tokenizeLine(rawLine, lineNum);

    // Emit NEWLINE at the end of physical lines (not inside brackets)
    if (!parenDepth) {
      const last = tokens[tokens.length - 1];
      if (last && last.kind !== "NEWLINE" && last.kind !== "INDENT" && last.kind !== "DEDENT") {
        tokens.push(tok("NEWLINE", "\n", lineNum, rawLine.length + 1));
      }
    }
  }

  // Flush remaining DEDENTs
  const lastLine = rawLines.length;
  while (indentStack.length > 1) {
    indentStack.pop();
    tokens.push(tok("DEDENT", "", lastLine, 1));
  }

  // Ensure trailing NEWLINE before EOF
  if (tokens.length > 0) {
    const last = tokens[tokens.length - 1];
    if (last.kind !== "NEWLINE" && last.kind !== "DEDENT") {
      tokens.push(tok("NEWLINE", "", lastLine, 1));
    }
  }

  tokens.push(tok("EOF", "", lastLine + 1, 1));

  return tokens;
}
