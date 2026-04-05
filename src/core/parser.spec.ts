import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenizer';
import { parse } from './parser';

function parseCode(code: string) {
  return parse(tokenize(code));
}

describe('parser', () => {
  it('parses print statement', () => {
    const ast = parseCode('print("hello")\n');
    expect(ast.body[0].type).toBe('PrintStmt');
  });

  it('parses assignment', () => {
    const ast = parseCode('x = 42\n');
    expect(ast.body[0].type).toBe('AssignStmt');
    const stmt = ast.body[0] as import('./ast').AssignStmt;
    expect(stmt.target).toBe('x');
    expect((stmt.value as import('./ast').NumberLiteral).value).toBe(42);
  });

  it('parses if/else', () => {
    const ast = parseCode('if x > 0:\n    print("pos")\nelse:\n    print("neg")\n');
    expect(ast.body[0].type).toBe('IfStmt');
  });

  it('parses for loop', () => {
    const ast = parseCode('for i in range(10):\n    print(i)\n');
    expect(ast.body[0].type).toBe('ForStmt');
  });

  it('parses while loop', () => {
    const ast = parseCode('while x > 0:\n    x = x - 1\n');
    expect(ast.body[0].type).toBe('WhileStmt');
  });

  it('parses function definition', () => {
    const ast = parseCode('def add(a, b):\n    return a + b\n');
    expect(ast.body[0].type).toBe('DefStmt');
    const def = ast.body[0] as import('./ast').DefStmt;
    expect(def.name).toBe('add');
    expect(def.params).toEqual(['a', 'b']);
  });

  it('parses list literal', () => {
    const ast = parseCode('x = [1, 2, 3]\n');
    const stmt = ast.body[0] as import('./ast').AssignStmt;
    expect(stmt.value.type).toBe('ListLiteral');
  });

  it('parses index access', () => {
    const ast = parseCode('x = a[0]\n');
    const stmt = ast.body[0] as import('./ast').AssignStmt;
    expect(stmt.value.type).toBe('IndexAccess');
  });

  it('parses attribute access (module calls)', () => {
    const ast = parseCode('x = random.randrange(10)\n');
    const stmt = ast.body[0] as import('./ast').AssignStmt;
    expect(stmt.value.type).toBe('FuncCall');
  });

  it('parses binary operators with precedence', () => {
    const ast = parseCode('x = 2 + 3 * 4\n');
    const stmt = ast.body[0] as import('./ast').AssignStmt;
    // Should be: 2 + (3 * 4)
    const binop = stmt.value as import('./ast').BinOp;
    expect(binop.op).toBe('+');
    const right = binop.right as import('./ast').BinOp;
    expect(right.op).toBe('*');
  });
});
