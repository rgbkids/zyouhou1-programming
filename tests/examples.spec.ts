import { describe, it, expect } from 'vitest';
import { runCode } from '../src/runtime/evaluator.js';
import { SAMPLES } from '../src/samples/index.js';

function stdout(source: string, seed?: number): string[] {
  const r = runCode(source, seed);
  return r.output.filter(l => l.kind === 'stdout').map(l => l.text);
}

describe('Sample programs execute without error', () => {
  for (const sample of SAMPLES) {
    // Skip device/webapi samples that require special runtime
    if (sample.id === 'device_demo') continue;

    it(`[${sample.category}] ${sample.label}`, () => {
      const result = runCode(sample.code, 42);
      // Should not have a fatal error (output lines may be stderr for expected errors)
      // We only check that the program doesn't crash unexpectedly
      const fatalErrors = result.output.filter(l =>
        l.kind === 'stderr' && l.text.includes('エラー')
      );
      if (result.error) {
        // Acceptable: program may use 'device.*' without device runtime
        if (result.error.includes('未定義') && sample.code.includes('device.')) return;
      }
      expect(result.error).toBeNull();
    });
  }
});

describe('Golden output tests', () => {
  it('sequential greetings', () => {
    const code = 'print("おはようございます")\nprint("こんにちは")\nprint("おやすみなさい")\n';
    expect(stdout(code)).toEqual(['おはようございます', 'こんにちは', 'おやすみなさい']);
  });

  it('branch: pass/fail', () => {
    const pass = stdout('score = 70\nif score >= 60:\n    print("合格")\nelse:\n    print("不合格")\n');
    expect(pass).toEqual(['合格']);
    const fail = stdout('score = 50\nif score >= 60:\n    print("合格")\nelse:\n    print("不合格")\n');
    expect(fail).toEqual(['不合格']);
  });

  it('loop: sum 1 to 5', () => {
    const code = 'total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n';
    expect(stdout(code)).toEqual(['15']);
  });

  it('loop: odd numbers 1-9', () => {
    const code = 'for i in range(1, 10):\n    if i % 2 != 0:\n        print(i)\n';
    expect(stdout(code)).toEqual(['1', '3', '5', '7', '9']);
  });

  it('list: sum function', () => {
    const code = 'def sum_list(a):\n    t = 0\n    for i in range(len(a)):\n        t = t + a[i]\n    return t\nprint(sum_list([1, 2, 3, 4, 5]))\n';
    expect(stdout(code)).toEqual(['15']);
  });

  it('random: randrange in bounds (seed fixed)', () => {
    const results = new Set<number>();
    for (let seed = 0; seed < 20; seed++) {
      const r = runCode('import random\nprint(random.randrange(6))\n', seed);
      const v = parseInt(r.output[0]?.text ?? '0', 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(6);
      results.add(v);
    }
    // Over 20 seeds we should see at least 3 different values
    expect(results.size).toBeGreaterThanOrEqual(3);
  });

  it('function: factorial', () => {
    const code = 'def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\nprint(fact(10))\n';
    expect(stdout(code)).toEqual(['3628800']);
  });

  it('error: undefined variable produces error output', () => {
    const r = runCode('print(undefined_var)\n');
    expect(r.error).not.toBeNull();
    expect(r.errorLine).toBeDefined();
  });

  it('floating point error demo', () => {
    const r = runCode('print(0.28 - 0.27)\n');
    expect(r.error).toBeNull();
    // Result is not exactly 0.01 due to floating point
    expect(r.output[0]?.text).not.toBe('0.01');
  });

  it('integer workaround for float error', () => {
    const code = 'a = 28\nb = 27\nprint((a - b) / 100)\n';
    expect(stdout(code)).toEqual(['0.01']);
  });

  it('linear search', () => {
    const code = 'def ls(a, t):\n    for i in range(len(a)):\n        if a[i] == t:\n            return i\n    return -1\nprint(ls([5, 3, 8, 1, 9], 8))\n';
    expect(stdout(code)).toEqual(['2']);
  });

  it('binary search', () => {
    const code = `def bs(a, t):
    l = 0
    r = len(a) - 1
    while l <= r:
        m = (l + r) // 2
        if a[m] == t:
            return m
        elif a[m] < t:
            l = m + 1
        else:
            r = m - 1
    return -1
print(bs([1, 2, 3, 4, 5, 6, 7, 8, 9], 7))
`;
    expect(stdout(code)).toEqual(['6']);
  });
});

describe('Trace / step limit', () => {
  it('infinite loop is stopped by step limit', () => {
    const r = runCode('x = 0\nwhile True:\n    x = x + 1\n');
    expect(r.error).not.toBeNull();
    expect(r.error).toContain('ステップ');
  });
});
