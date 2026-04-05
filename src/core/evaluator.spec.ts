import { describe, it, expect } from 'vitest';
import { tokenize } from './tokenizer';
import { parse } from './parser';
import { evaluate } from './evaluator';
import { createBuffer } from './io';
import { createGlobals, setRandomSeed, resetRandomSeed } from '../builtins/builtins';

function run(code: string): { lines: string[]; errors: { message: string; line?: number }[] } {
  const { buffer, hooks } = createBuffer();
  const globals = createGlobals(hooks);
  const tokens = tokenize(code);
  const ast = parse(tokens);
  evaluate(ast, { io: hooks, globals });
  return buffer;
}

describe('evaluator', () => {
  it('prints hello world', () => {
    const { lines } = run('print("hello")\n');
    expect(lines).toEqual(['hello']);
  });

  it('evaluates arithmetic', () => {
    const { lines } = run('print(2 + 3 * 4)\n');
    expect(lines).toEqual(['14']);
  });

  it('handles assignment and variables', () => {
    const { lines } = run('x = 42\nprint(x)\n');
    expect(lines).toEqual(['42']);
  });

  it('handles if/else (true branch)', () => {
    const { lines } = run('x = 10\nif x > 5:\n    print("big")\nelse:\n    print("small")\n');
    expect(lines).toEqual(['big']);
  });

  it('handles if/else (false branch)', () => {
    const { lines } = run('x = 3\nif x > 5:\n    print("big")\nelse:\n    print("small")\n');
    expect(lines).toEqual(['small']);
  });

  it('handles for loop with range', () => {
    const { lines } = run('for i in range(3):\n    print(i)\n');
    expect(lines).toEqual(['0', '1', '2']);
  });

  it('handles while loop', () => {
    const { lines } = run('x = 3\nwhile x > 0:\n    print(x)\n    x = x - 1\n');
    expect(lines).toEqual(['3', '2', '1']);
  });

  it('handles function definition and call', () => {
    const { lines } = run('def add(a, b):\n    return a + b\nprint(add(3, 4))\n');
    expect(lines).toEqual(['7']);
  });

  it('handles list operations', () => {
    const { lines } = run('a = [1, 2, 3]\nprint(len(a))\nprint(a[0])\n');
    expect(lines).toEqual(['3', '1']);
  });

  it('handles list index assignment', () => {
    const { lines } = run('a = [1, 2, 3]\na[1] = 99\nprint(a)\n');
    expect(lines).toEqual(['[1, 99, 3]']);
  });

  it('handles string concatenation', () => {
    const { lines } = run('s = "hello" + " " + "world"\nprint(s)\n');
    expect(lines).toEqual(['hello world']);
  });

  it('handles sum of range', () => {
    const { lines } = run('total = 0\nfor i in range(1, 11):\n    total = total + i\nprint(total)\n');
    expect(lines).toEqual(['55']);
  });

  it('handles random with seed', () => {
    setRandomSeed(42);
    const { lines } = run('print(random.randrange(6))\n');
    resetRandomSeed();
    // Just check it's a number 0-5
    const n = parseInt(lines[0]);
    expect(n).toBeGreaterThanOrEqual(0);
    expect(n).toBeLessThan(6);
  });

  it('handles nested functions', () => {
    const { lines } = run('def greet(name):\n    return "Hello, " + name\nprint(greet("Taro"))\n');
    expect(lines).toEqual(['Hello, Taro']);
  });

  it('handles boolean logic', () => {
    const { lines } = run('print(True and False)\nprint(True or False)\nprint(not True)\n');
    expect(lines).toEqual(['False', 'True', 'False']);
  });

  it('handles floor division and modulo', () => {
    const { lines } = run('print(10 // 3)\nprint(10 % 3)\n');
    expect(lines).toEqual(['3', '1']);
  });

  it('throws on undefined variable', () => {
    expect(() => run('print(undefined_var)\n')).toThrow();
  });

  it('throws on out-of-bounds index', () => {
    expect(() => run('a = [1, 2]\nprint(a[5])\n')).toThrow();
  });
});
