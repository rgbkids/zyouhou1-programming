// Tokenizer for the Info-I language subset

export type TokenKind =
  | 'NUMBER'
  | 'STRING'
  | 'NAME'
  | 'OP'       // operators and punctuation
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF';

export interface Token {
  kind: TokenKind;
  value: string;
  line: number;
  col: number;
}

export class TokenizeError extends Error {
  constructor(msg: string, public line: number, public col: number) {
    super(`[行${line}:列${col}] ${msg}`);
  }
}

const KEYWORDS = new Set([
  'if', 'elif', 'else', 'for', 'while', 'def', 'return',
  'break', 'continue', 'and', 'or', 'not', 'in',
  'True', 'False', 'None', 'import', 'from',
]);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.split('\n');
  const indentStack: number[] = [0];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineNum = lineIdx + 1;
    const line = lines[lineIdx];

    // Count leading spaces
    let col = 0;
    while (col < line.length && (line[col] === ' ' || line[col] === '\t')) {
      col += line[col] === '\t' ? 4 : 1;
    }

    const rest = line.slice(col === 0 ? 0 : countRawSpaces(line));

    // Skip blank lines and comment-only lines
    if (rest.trim() === '' || rest.trim().startsWith('#')) {
      continue;
    }

    // Emit INDENT / DEDENT tokens
    const currentIndent = col;
    const topIndent = indentStack[indentStack.length - 1]!;

    if (currentIndent > topIndent) {
      indentStack.push(currentIndent);
      tokens.push({ kind: 'INDENT', value: '', line: lineNum, col: 1 });
    } else if (currentIndent < topIndent) {
      while (indentStack.length > 1 && indentStack[indentStack.length - 1]! > currentIndent) {
        indentStack.pop();
        tokens.push({ kind: 'DEDENT', value: '', line: lineNum, col: 1 });
      }
      if (indentStack[indentStack.length - 1] !== currentIndent) {
        throw new TokenizeError('インデントが一致しません', lineNum, 1);
      }
    }

    // Tokenize the line content
    const rawLine = line;
    let pos = countRawSpaces(rawLine); // skip leading whitespace

    while (pos < rawLine.length) {
      // Skip spaces within line
      if (rawLine[pos] === ' ' || rawLine[pos] === '\t') {
        pos++;
        continue;
      }

      const ch = rawLine[pos]!;
      const colNum = pos + 1;

      // Comment
      if (ch === '#') break;

      // String literals
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let s = '';
        pos++;
        while (pos < rawLine.length && rawLine[pos] !== quote) {
          if (rawLine[pos] === '\\') {
            pos++;
            const esc = rawLine[pos];
            if (esc === 'n') s += '\n';
            else if (esc === 't') s += '\t';
            else if (esc === '\\') s += '\\';
            else if (esc === '"') s += '"';
            else if (esc === "'") s += "'";
            else s += esc ?? '';
          } else {
            s += rawLine[pos];
          }
          pos++;
        }
        if (pos >= rawLine.length) {
          throw new TokenizeError('文字列が閉じられていません', lineNum, colNum);
        }
        pos++; // closing quote
        tokens.push({ kind: 'STRING', value: s, line: lineNum, col: colNum });
        continue;
      }

      // Numbers
      if (isDigit(ch)) {
        let num = '';
        while (pos < rawLine.length && (isDigit(rawLine[pos]!) || rawLine[pos] === '.')) {
          num += rawLine[pos];
          pos++;
        }
        tokens.push({ kind: 'NUMBER', value: num, line: lineNum, col: colNum });
        continue;
      }

      // Identifiers / keywords
      if (isAlpha(ch)) {
        let name = '';
        while (pos < rawLine.length && isAlphaNum(rawLine[pos]!)) {
          name += rawLine[pos];
          pos++;
        }
        tokens.push({ kind: 'NAME', value: name, line: lineNum, col: colNum });
        continue;
      }

      // Two-char operators
      const two = rawLine.slice(pos, pos + 2);
      if (['==', '!=', '<=', '>=', '**', '//', '+=', '-='].includes(two)) {
        tokens.push({ kind: 'OP', value: two, line: lineNum, col: colNum });
        pos += 2;
        continue;
      }

      // Single-char operators / punctuation
      if ('+-*/%<>=()[]{}:,.'.includes(ch)) {
        tokens.push({ kind: 'OP', value: ch, line: lineNum, col: colNum });
        pos++;
        continue;
      }

      throw new TokenizeError(`不明な文字: ${ch}`, lineNum, colNum);
    }

    tokens.push({ kind: 'NEWLINE', value: '', line: lineNum, col: rawLine.length + 1 });
  }

  // Emit remaining DEDENTs
  while (indentStack.length > 1) {
    indentStack.pop();
    tokens.push({ kind: 'DEDENT', value: '', line: lines.length, col: 1 });
  }

  tokens.push({ kind: 'EOF', value: '', line: lines.length + 1, col: 1 });
  return tokens;
}

function countRawSpaces(line: string): number {
  let i = 0;
  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i++;
  return i;
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function isAlpha(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
}

function isAlphaNum(ch: string): boolean {
  return isAlpha(ch) || isDigit(ch);
}

export { KEYWORDS };
