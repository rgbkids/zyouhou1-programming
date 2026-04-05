// Value types for the Jouhou-I runtime

import type { Stmt } from './ast';
import type { Environment } from './environment';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

export type Value =
  | NumberValue
  | StringValue
  | BoolValue
  | NoneValue
  | ListValue
  | FunctionValue
  | BuiltinValue
  | ModuleValue;

export interface NumberValue {
  type: 'number';
  value: number;
}

export interface StringValue {
  type: 'string';
  value: string;
}

export interface BoolValue {
  type: 'bool';
  value: boolean;
}

export interface NoneValue {
  type: 'none';
}

export interface ListValue {
  type: 'list';
  elements: Value[];
}

export interface FunctionValue {
  type: 'function';
  name: string;
  params: string[];
  body: Stmt[];
  closure: Environment;
}

export interface BuiltinValue {
  type: 'builtin';
  name: string;
  call: (args: Value[]) => Value;
}

export interface ModuleValue {
  type: 'module';
  name: string;
  attrs: Record<string, Value>;
}

// Control flow signals (thrown as exceptions internally)
export class ReturnSignal {
  value: Value;
  constructor(v: Value) { this.value = v; }
}
export class BreakSignal {}
export class ContinueSignal {}

// Helpers
export const NONE: NoneValue = { type: 'none' };
export const TRUE: BoolValue = { type: 'bool', value: true };
export const FALSE: BoolValue = { type: 'bool', value: false };

export function num(v: number): NumberValue { return { type: 'number', value: v }; }
export function str(v: string): StringValue { return { type: 'string', value: v }; }
export function bool(v: boolean): BoolValue { return v ? TRUE : FALSE; }
export function list(elements: Value[]): ListValue { return { type: 'list', elements }; }

export function isTruthy(v: Value): boolean {
  switch (v.type) {
    case 'bool': return v.value;
    case 'number': return v.value !== 0;
    case 'string': return v.value !== '';
    case 'none': return false;
    case 'list': return v.elements.length > 0;
    default: return true;
  }
}

export function valueToString(v: Value): string {
  switch (v.type) {
    case 'number': return String(v.value);
    case 'string': return v.value;
    case 'bool': return v.value ? 'True' : 'False';
    case 'none': return 'None';
    case 'list': return '[' + v.elements.map(valueToString).join(', ') + ']';
    case 'function': return `<function ${v.name}>`;
    case 'builtin': return `<builtin ${v.name}>`;
    case 'module': return `<module ${v.name}>`;
  }
}
