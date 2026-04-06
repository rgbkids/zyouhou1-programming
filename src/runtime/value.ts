// Runtime value types

export type Value =
  | { type: 'number'; v: number }
  | { type: 'string'; v: string }
  | { type: 'bool'; v: boolean }
  | { type: 'none' }
  | { type: 'list'; v: Value[] }
  | { type: 'function'; name: string; params: string[]; body: import('../lang/ast.js').Stmt[]; closure: Environment }
  | { type: 'builtin'; name: string; fn: (...args: Value[]) => Value };

import type { Environment } from './environment.js';

export function repr(v: Value): string {
  switch (v.type) {
    case 'number': {
      // Match Python-style: integers show without decimal, floats show with
      if (Number.isInteger(v.v)) return String(v.v);
      return String(v.v);
    }
    case 'string': return v.v;
    case 'bool': return v.v ? 'True' : 'False';
    case 'none': return 'None';
    case 'list': return '[' + v.v.map(repr).join(', ') + ']';
    case 'function': return `<function ${v.name}>`;
    case 'builtin': return `<builtin ${v.name}>`;
  }
}

export function isTruthy(v: Value): boolean {
  switch (v.type) {
    case 'bool': return v.v;
    case 'number': return v.v !== 0;
    case 'string': return v.v !== '';
    case 'none': return false;
    case 'list': return v.v.length > 0;
    case 'function': return true;
    case 'builtin': return true;
  }
}

export const NONE: Value = { type: 'none' };
export const TRUE: Value = { type: 'bool', v: true };
export const FALSE: Value = { type: 'bool', v: false };
export const ZERO: Value = { type: 'number', v: 0 };

export function numVal(n: number): Value { return { type: 'number', v: n }; }
export function strVal(s: string): Value { return { type: 'string', v: s }; }
export function boolVal(b: boolean): Value { return b ? TRUE : FALSE; }
export function listVal(items: Value[]): Value { return { type: 'list', v: items }; }
