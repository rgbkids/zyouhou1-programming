import { describe, it, expect } from 'vitest';
import { runCode } from '../src/runtime/evaluator.js';

function stdout(source: string, seed?: number): string[] {
  const r = runCode(source, seed);
  return r.output.filter(l => l.kind === 'stdout').map(l => l.text);
}

function hasError(source: string): boolean {
  return runCode(source).error !== null;
}

describe('Evaluator: basics', () => {
  it('prints a number', () => {
    expect(stdout('print(42)\n')).toEqual(['42']);
  });

  it('prints a string', () => {
    expect(stdout('print("hello")\n')).toEqual(['hello']);
  });

  it('arithmetic', () => {
    expect(stdout('print(2 + 3)\n')).toEqual(['5']);
    expect(stdout('print(10 - 4)\n')).toEqual(['6']);
    expect(stdout('print(3 * 4)\n')).toEqual(['12']);
    expect(stdout('print(7 / 2)\n')).toEqual(['3.5']);
    expect(stdout('print(7 // 2)\n')).toEqual(['3']);
    expect(stdout('print(7 % 3)\n')).toEqual(['1']);
    expect(stdout('print(2 ** 8)\n')).toEqual(['256']);
  });

  it('variable assignment and use', () => {
    expect(stdout('x = 10\nprint(x)\n')).toEqual(['10']);
  });

  it('string concatenation', () => {
    expect(stdout('print("a" + "b")\n')).toEqual(['ab']);
  });
});

describe('Evaluator: control flow', () => {
  it('if true branch', () => {
    expect(stdout('x = 5\nif x > 3:\n    print("yes")\n')).toEqual(['yes']);
  });

  it('if false branch (else)', () => {
    expect(stdout('x = 1\nif x > 3:\n    print("yes")\nelse:\n    print("no")\n')).toEqual(['no']);
  });

  it('for range prints sequence', () => {
    expect(stdout('for i in range(3):\n    print(i)\n')).toEqual(['0', '1', '2']);
  });

  it('for range with start/stop', () => {
    expect(stdout('for i in range(1, 4):\n    print(i)\n')).toEqual(['1', '2', '3']);
  });

  it('for range with step', () => {
    expect(stdout('for i in range(0, 10, 3):\n    print(i)\n')).toEqual(['0', '3', '6', '9']);
  });

  it('while loop', () => {
    expect(stdout('x = 0\nwhile x < 3:\n    print(x)\n    x = x + 1\n')).toEqual(['0', '1', '2']);
  });

  it('elif', () => {
    const code = 'x = 0\nif x > 0:\n    print("pos")\nelif x == 0:\n    print("zero")\nelse:\n    print("neg")\n';
    expect(stdout(code)).toEqual(['zero']);
  });
});

describe('Evaluator: lists', () => {
  it('list indexing', () => {
    expect(stdout('a = [10, 20, 30]\nprint(a[1])\n')).toEqual(['20']);
  });

  it('len of list', () => {
    expect(stdout('a = [1, 2, 3]\nprint(len(a))\n')).toEqual(['3']);
  });

  it('list element assignment', () => {
    expect(stdout('a = [1, 2, 3]\na[0] = 99\nprint(a[0])\n')).toEqual(['99']);
  });

  it('out of bounds raises error', () => {
    expect(hasError('a = [1, 2]\nprint(a[5])\n')).toBe(true);
  });

  it('negative index', () => {
    expect(stdout('a = [1, 2, 3]\nprint(a[-1])\n')).toEqual(['3']);
  });
});

describe('Evaluator: functions', () => {
  it('basic function call', () => {
    expect(stdout('def greet(name):\n    print("Hello", name)\ngreet("世界")\n')).toEqual(['Hello 世界']);
  });

  it('return value', () => {
    expect(stdout('def add(a, b):\n    return a + b\nprint(add(3, 4))\n')).toEqual(['7']);
  });

  it('local scope', () => {
    expect(stdout('x = 10\ndef f():\n    x = 99\n    print(x)\nf()\nprint(x)\n')).toEqual(['99', '10']);
  });

  it('recursion (factorial)', () => {
    const code = 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\nprint(fact(5))\n';
    expect(stdout(code)).toEqual(['120']);
  });
});

describe('Evaluator: builtins', () => {
  it('int()', () => {
    expect(stdout('print(int(3.9))\n')).toEqual(['3']);
  });

  it('float()', () => {
    expect(stdout('print(float("3.14"))\n')).toEqual(['3.14']);
  });

  it('str()', () => {
    expect(stdout('print(str(42))\n')).toEqual(['42']);
  });

  it('len of string', () => {
    expect(stdout('print(len("abc"))\n')).toEqual(['3']);
  });
});

describe('Evaluator: random (seed-fixed)', () => {
  it('random.randrange returns int in range', () => {
    // with fixed seed, just test it's a valid integer
    const result = runCode('import random\nx = random.randrange(6)\nprint(x)\n', 42);
    const lines = result.output.filter(l => l.kind === 'stdout');
    expect(lines).toHaveLength(1);
    const v = parseInt(lines[0]!.text, 10);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(6);
  });
});

describe('Evaluator: errors', () => {
  it('undefined variable error', () => {
    expect(hasError('print(xyz)\n')).toBe(true);
  });

  it('division by zero', () => {
    expect(hasError('print(1 / 0)\n')).toBe(true);
  });

  it('step limit exceeded (infinite loop)', () => {
    expect(hasError('x = 0\nwhile x >= 0:\n    x = x + 1\n')).toBe(true);
  });
});

describe('Evaluator: floating point', () => {
  it('0.28 - 0.27 produces floating point error', () => {
    const r = runCode('print(0.28 - 0.27)\n');
    const line = r.output[0]?.text ?? '';
    // Should NOT be exactly "0.01"
    expect(line).not.toBe('0.01');
  });
});

describe('Evaluator: sample programs', () => {
  it('fibonacci', () => {
    const code = 'def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 2)\nfor i in range(7):\n    print(fib(i))\n';
    expect(stdout(code)).toEqual(['0', '1', '1', '2', '3', '5', '8']);
  });

  it('list sum function', () => {
    const code = 'def sum_list(a):\n    total = 0\n    for i in range(len(a)):\n        total = total + a[i]\n    return total\nprint(sum_list([1, 2, 3, 4, 5]))\n';
    expect(stdout(code)).toEqual(['15']);
  });

  it('linear search finds element', () => {
    const code = 'def linear_search(a, t):\n    for i in range(len(a)):\n        if a[i] == t:\n            return i\n    return -1\nprint(linear_search([5, 3, 8, 1], 8))\n';
    expect(stdout(code)).toEqual(['2']);
  });

  it('selection sort', () => {
    const code = 'def sort(a):\n    n = len(a)\n    for i in range(n):\n        m = i\n        for j in range(i + 1, n):\n            if a[j] < a[m]:\n                m = j\n        tmp = a[i]\n        a[i] = a[m]\n        a[m] = tmp\na = [3, 1, 4, 1, 5]\nsort(a)\nprint(a[0])\nprint(a[4])\n';
    expect(stdout(code)).toEqual(['1', '5']);
  });
});
