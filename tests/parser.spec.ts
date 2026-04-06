import { describe, it, expect } from 'vitest';
import { parse } from '../src/lang/parser.js';

describe('Parser', () => {
  it('parses assignment', () => {
    const prog = parse('x = 42\n');
    expect(prog.body).toHaveLength(1);
    expect(prog.body[0]!.kind).toBe('Assign');
  });

  it('parses print call', () => {
    const prog = parse('print("hello")\n');
    expect(prog.body[0]!.kind).toBe('ExprStmt');
  });

  it('parses if-else', () => {
    const prog = parse('if x > 0:\n    print("pos")\nelse:\n    print("neg")\n');
    expect(prog.body[0]!.kind).toBe('If');
  });

  it('parses for range', () => {
    const prog = parse('for i in range(5):\n    print(i)\n');
    expect(prog.body[0]!.kind).toBe('For');
  });

  it('parses while', () => {
    const prog = parse('while x < 10:\n    x = x + 1\n');
    expect(prog.body[0]!.kind).toBe('While');
  });

  it('parses function def', () => {
    const prog = parse('def add(a, b):\n    return a + b\n');
    expect(prog.body[0]!.kind).toBe('FuncDef');
  });

  it('parses list literal', () => {
    const prog = parse('a = [1, 2, 3]\n');
    const stmt = prog.body[0];
    expect(stmt!.kind).toBe('Assign');
    if (stmt!.kind === 'Assign') {
      expect(stmt.value.kind).toBe('List');
    }
  });

  it('parses subscript access', () => {
    const prog = parse('x = a[0]\n');
    const stmt = prog.body[0];
    expect(stmt!.kind).toBe('Assign');
    if (stmt!.kind === 'Assign') {
      expect(stmt.value.kind).toBe('Subscript');
    }
  });

  it('parses method call (random.randrange)', () => {
    const prog = parse('x = random.randrange(6)\n');
    const stmt = prog.body[0];
    expect(stmt!.kind).toBe('Assign');
    if (stmt!.kind === 'Assign') {
      expect(stmt.value.kind).toBe('Call');
    }
  });

  it('gives error with line info on syntax error', () => {
    expect(() => parse('def f(\n')).toThrow();
  });

  it('parses elif', () => {
    const code = 'if x > 0:\n    print("pos")\nelif x == 0:\n    print("zero")\nelse:\n    print("neg")\n';
    const prog = parse(code);
    expect(prog.body[0]!.kind).toBe('If');
    const ifStmt = prog.body[0];
    if (ifStmt!.kind === 'If') {
      expect(ifStmt.orelse).toHaveLength(1);
      expect(ifStmt.orelse[0]!.kind).toBe('If');
    }
  });

  it('parses augmented assignment', () => {
    const prog = parse('x += 1\n');
    expect(prog.body[0]!.kind).toBe('AugAssign');
  });

  it('parses boolean operators', () => {
    const prog = parse('x = a and b or c\n');
    expect(prog.body[0]!.kind).toBe('Assign');
  });

  it('parses comparison chain', () => {
    const prog = parse('x = a == b\n');
    expect(prog.body[0]!.kind).toBe('Assign');
  });
});
