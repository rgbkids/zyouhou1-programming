// Tokenizer for the Jouhou-I language subset

export type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'IDENT'
  | 'KEYWORD'
  | 'OP'
  | 'COMPARE'
  | 'ASSIGN'
  | 'LPAREN'
  | 'RPAREN'
  | 'LBRACKET'
  | 'RBRACKET'
  | 'COMMA'
  | 'COLON'
  | 'DOT'
  | 'NEWLINE'
  | 'INDENT'
  | 'DEDENT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

const KEYWORDS = new Set([
  'if', 'else', 'elif', 'for', 'while', 'in', 'def', 'return',
  'and', 'or', 'not', 'True', 'False', 'None', 'break', 'continue',
]);

export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.split('\n');
  const indentStack: number[] = [0];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const lnum = lineNum + 1;

    // Count leading spaces
    let col = 0;
    while (col < line.length && line[col] === ' ') col++;

    const indentLevel = col;
    const content = line.slice(col);

    // Skip blank lines and comment lines
    if (content.trim() === '' || content.trimStart().startsWith('#')) continue;

    // Emit INDENT / DEDENT
    const currentIndent = indentStack[indentStack.length - 1];
    if (indentLevel > currentIndent) {
      indentStack.push(indentLevel);
      tokens.push({ type: 'INDENT', value: '', line: lnum, col: 0 });
    } else if (indentLevel < currentIndent) {
      while (indentStack[indentStack.length - 1] > indentLevel) {
        indentStack.pop();
        tokens.push({ type: 'DEDENT', value: '', line: lnum, col: 0 });
      }
    }

    // Tokenize the content of the line
    let pos = col;
    while (pos < line.length) {
      const ch = line[pos];

      // Skip whitespace (not newline)
      if (ch === ' ' || ch === '\t') { pos++; continue; }

      // Skip inline comments
      if (ch === '#') break;

      // String literals
      if (ch === '"' || ch === "'") {
        const quote = ch;
        let str = '';
        pos++;
        while (pos < line.length && line[pos] !== quote) {
          if (line[pos] === '\\' && pos + 1 < line.length) {
            const esc = line[pos + 1];
            if (esc === 'n') str += '\n';
            else if (esc === 't') str += '\t';
            else str += esc;
            pos += 2;
          } else {
            str += line[pos++];
          }
        }
        pos++; // closing quote
        tokens.push({ type: 'STRING', value: str, line: lnum, col: pos });
        continue;
      }

      // Number literals
      if (ch >= '0' && ch <= '9') {
        let num = '';
        while (pos < line.length && (line[pos] >= '0' && line[pos] <= '9' || line[pos] === '.')) {
          num += line[pos++];
        }
        tokens.push({ type: 'NUMBER', value: num, line: lnum, col: pos });
        continue;
      }

      // Identifiers and keywords
      if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
        let ident = '';
        while (pos < line.length &&
          ((line[pos] >= 'a' && line[pos] <= 'z') ||
           (line[pos] >= 'A' && line[pos] <= 'Z') ||
           (line[pos] >= '0' && line[pos] <= '9') ||
           line[pos] === '_')) {
          ident += line[pos++];
        }
        const type = KEYWORDS.has(ident) ? 'KEYWORD' : 'IDENT';
        tokens.push({ type, value: ident, line: lnum, col: pos });
        continue;
      }

      // Two-char operators / comparisons
      const two = line.slice(pos, pos + 2);
      if (two === '==' || two === '!=' || two === '<=' || two === '>=' || two === '//' || two === '**') {
        if (two === '==' || two === '!=' || two === '<=' || two === '>=') {
          tokens.push({ type: 'COMPARE', value: two, line: lnum, col: pos });
        } else {
          tokens.push({ type: 'OP', value: two, line: lnum, col: pos });
        }
        pos += 2;
        continue;
      }

      // Single-char tokens
      if (ch === '=') { tokens.push({ type: 'ASSIGN', value: '=', line: lnum, col: pos }); pos++; continue; }
      if (ch === '<' || ch === '>') { tokens.push({ type: 'COMPARE', value: ch, line: lnum, col: pos }); pos++; continue; }
      if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%') {
        tokens.push({ type: 'OP', value: ch, line: lnum, col: pos }); pos++; continue;
      }
      if (ch === '(') { tokens.push({ type: 'LPAREN', value: '(', line: lnum, col: pos }); pos++; continue; }
      if (ch === ')') { tokens.push({ type: 'RPAREN', value: ')', line: lnum, col: pos }); pos++; continue; }
      if (ch === '[') { tokens.push({ type: 'LBRACKET', value: '[', line: lnum, col: pos }); pos++; continue; }
      if (ch === ']') { tokens.push({ type: 'RBRACKET', value: ']', line: lnum, col: pos }); pos++; continue; }
      if (ch === ',') { tokens.push({ type: 'COMMA', value: ',', line: lnum, col: pos }); pos++; continue; }
      if (ch === ':') { tokens.push({ type: 'COLON', value: ':', line: lnum, col: pos }); pos++; continue; }
      if (ch === '.') { tokens.push({ type: 'DOT', value: '.', line: lnum, col: pos }); pos++; continue; }

      throw new SyntaxError(`Unexpected character '${ch}' at line ${lnum}, col ${pos + 1}`);
    }

    tokens.push({ type: 'NEWLINE', value: '\n', line: lnum, col: line.length });
  }

  // Emit remaining DEDENTs
  while (indentStack.length > 1) {
    indentStack.pop();
    tokens.push({ type: 'DEDENT', value: '', line: lines.length, col: 0 });
  }

  tokens.push({ type: 'EOF', value: '', line: lines.length + 1, col: 0 });
  return tokens;
}
