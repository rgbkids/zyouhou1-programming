// Builtin functions and modules for the Jouhou-I runtime

import type { Value, BuiltinValue, ModuleValue } from '../core/value';
import {
  NONE, num, str, bool, list,
  valueToString,
  type ListValue,
  type NumberValue,
} from '../core/value';
import { RuntimeError } from '../core/evaluator';

// Seeded random for reproducible tests
let randomSeed = Math.random;

export function setRandomSeed(seed: number) {
  // Simple mulberry32 PRNG
  let s = seed | 0;
  randomSeed = () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function resetRandomSeed() {
  randomSeed = Math.random;
}

function mkBuiltin(name: string, call: (args: Value[]) => Value): BuiltinValue {
  return { type: 'builtin', name, call };
}

function assertArity(name: string, args: Value[], min: number, max = min) {
  if (args.length < min || args.length > max) {
    throw new RuntimeError(`${name}() takes ${min === max ? min : `${min}-${max}`} arguments, got ${args.length}`, 0);
  }
}

function assertType(name: string, val: Value, expected: Value['type']): void {
  if (val.type !== expected) {
    throw new RuntimeError(`${name}() expects ${expected}, got ${val.type}`, 0);
  }
}

// print() - already handled as PrintStmt, but available as function too
export const builtinPrint = (io: { print: (s: string) => void }) =>
  mkBuiltin('print', (args) => {
    io.print(args.map(valueToString).join(' '));
    return NONE;
  });

// len(list | string)
export const builtinLen = mkBuiltin('len', (args) => {
  assertArity('len', args, 1);
  const v = args[0];
  if (v.type === 'list') return num(v.elements.length);
  if (v.type === 'string') return num(v.value.length);
  throw new RuntimeError(`len() argument must be list or string, got ${v.type}`, 0);
});

// range(stop) | range(start, stop) | range(start, stop, step)
export const builtinRange = mkBuiltin('range', (args) => {
  assertArity('range', args, 1, 3);
  let start = 0, stop: number, step = 1;
  if (args.length === 1) {
    assertType('range', args[0], 'number');
    stop = Math.trunc((args[0] as NumberValue).value);
  } else {
    assertType('range', args[0], 'number');
    assertType('range', args[1], 'number');
    start = Math.trunc((args[0] as NumberValue).value);
    stop = Math.trunc((args[1] as NumberValue).value);
    if (args.length === 3) {
      assertType('range', args[2], 'number');
      step = Math.trunc((args[2] as NumberValue).value);
      if (step === 0) throw new RuntimeError('range() step argument must not be zero', 0);
    }
  }
  const items: Value[] = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) items.push(num(i));
  } else {
    for (let i = start; i > stop; i += step) items.push(num(i));
  }
  return list(items);
});

// int(v)
export const builtinInt = mkBuiltin('int', (args) => {
  assertArity('int', args, 1);
  const v = args[0];
  if (v.type === 'number') return num(Math.trunc(v.value));
  if (v.type === 'string') {
    const n = parseInt(v.value, 10);
    if (isNaN(n)) throw new RuntimeError(`int() invalid literal: '${v.value}'`, 0);
    return num(n);
  }
  if (v.type === 'bool') return num(v.value ? 1 : 0);
  throw new RuntimeError(`int() can't convert ${v.type}`, 0);
});

// float(v)
export const builtinFloat = mkBuiltin('float', (args) => {
  assertArity('float', args, 1);
  const v = args[0];
  if (v.type === 'number') return v;
  if (v.type === 'string') {
    const n = parseFloat(v.value);
    if (isNaN(n)) throw new RuntimeError(`float() invalid literal: '${v.value}'`, 0);
    return num(n);
  }
  throw new RuntimeError(`float() can't convert ${v.type}`, 0);
});

// str(v)
export const builtinStr = mkBuiltin('str', (args) => {
  assertArity('str', args, 1);
  return str(valueToString(args[0]));
});

// abs(n)
export const builtinAbs = mkBuiltin('abs', (args) => {
  assertArity('abs', args, 1);
  assertType('abs', args[0], 'number');
  return num(Math.abs((args[0] as NumberValue).value));
});

// max(a, b) | max(list)
export const builtinMax = mkBuiltin('max', (args) => {
  const items = args.length === 1 && args[0].type === 'list'
    ? (args[0] as ListValue).elements
    : args;
  if (items.length === 0) throw new RuntimeError('max() arg is an empty sequence', 0);
  items.forEach(v => assertType('max', v, 'number'));
  return num(Math.max(...items.map(v => (v as NumberValue).value)));
});

// min(a, b) | min(list)
export const builtinMin = mkBuiltin('min', (args) => {
  const items = args.length === 1 && args[0].type === 'list'
    ? (args[0] as ListValue).elements
    : args;
  if (items.length === 0) throw new RuntimeError('min() arg is an empty sequence', 0);
  items.forEach(v => assertType('min', v, 'number'));
  return num(Math.min(...items.map(v => (v as NumberValue).value)));
});

// sum(list)
export const builtinSum = mkBuiltin('sum', (args) => {
  assertArity('sum', args, 1);
  assertType('sum', args[0], 'list');
  const items = (args[0] as ListValue).elements;
  items.forEach(v => assertType('sum', v, 'number'));
  return num(items.reduce((acc, v) => acc + (v as NumberValue).value, 0));
});

// random module
export function createRandomModule(): ModuleValue {
  return {
    type: 'module',
    name: 'random',
    attrs: {
      randrange: mkBuiltin('randrange', (args) => {
        assertArity('randrange', args, 1, 2);
        assertType('randrange', args[0], 'number');
        const stop = Math.trunc((args[0] as NumberValue).value);
        let start = 0;
        if (args.length === 2) {
          assertType('randrange', args[1], 'number');
          start = stop;
          // Actually: randrange(start, stop)
        }
        const range = stop - start;
        return num(start + Math.floor(randomSeed() * range));
      }),
      random: mkBuiltin('random', (_args) => {
        return num(randomSeed());
      }),
    },
  };
}

// math module
export const mathModule: ModuleValue = {
  type: 'module',
  name: 'math',
  attrs: {
    sqrt: mkBuiltin('sqrt', (args) => {
      assertArity('sqrt', args, 1);
      assertType('sqrt', args[0], 'number');
      return num(Math.sqrt((args[0] as NumberValue).value));
    }),
    floor: mkBuiltin('floor', (args) => {
      assertArity('floor', args, 1);
      assertType('floor', args[0], 'number');
      return num(Math.floor((args[0] as NumberValue).value));
    }),
    ceil: mkBuiltin('ceil', (args) => {
      assertArity('ceil', args, 1);
      assertType('ceil', args[0], 'number');
      return num(Math.ceil((args[0] as NumberValue).value));
    }),
    pi: num(Math.PI),
  },
};

/** Build the default globals record for the evaluator */
export function createGlobals(io: { print: (s: string) => void }): Record<string, Value> {
  return {
    print: builtinPrint(io),
    len: builtinLen,
    range: builtinRange,
    int: builtinInt,
    float: builtinFloat,
    str: builtinStr,
    abs: builtinAbs,
    max: builtinMax,
    min: builtinMin,
    sum: builtinSum,
    True: bool(true),
    False: bool(false),
    None: NONE,
    random: createRandomModule(),
    math: mathModule,
  };
}
