// Runtime value types for info1 language

import type { Stmt } from "../lang/ast";
import type { Environment } from "./environment";

export type Value =
  | { kind: "number";   value: number }
  | { kind: "string";   value: string }
  | { kind: "bool";     value: boolean }
  | { kind: "none" }
  | { kind: "list";     items: Value[] }
  | { kind: "function"; name: string; params: string[]; body: Stmt[]; closure: Environment }
  | { kind: "builtin";  name: string; fn: BuiltinFn }
  | { kind: "module";   name: string; attrs: Record<string, Value> }
  ;

export type BuiltinFn = (args: Value[]) => Value | Promise<Value>;

// ─── Value helpers ────────────────────────────────────────────────────────────

export function isTruthy(v: Value): boolean {
  switch (v.kind) {
    case "bool":   return v.value;
    case "number": return v.value !== 0;
    case "string": return v.value.length > 0;
    case "none":   return false;
    case "list":   return v.items.length > 0;
    default:       return true;
  }
}

export function valueToString(v: Value): string {
  switch (v.kind) {
    case "number": {
      // Reproduce Python-like number display
      if (Number.isInteger(v.value)) return String(v.value);
      return String(v.value);
    }
    case "string":   return v.value;
    case "bool":     return v.value ? "True" : "False";
    case "none":     return "None";
    case "list":     return "[" + v.items.map(valueToString).join(", ") + "]";
    case "function": return `<function ${v.name}>`;
    case "builtin":  return `<builtin ${v.name}>`;
    case "module":   return `<module ${v.name}>`;
  }
}

export function valueEquals(a: Value, b: Value): boolean {
  if (a.kind !== b.kind) {
    // Allow number comparison with different representations
    if (a.kind === "number" && b.kind === "number") return a.value === b.value;
    return false;
  }
  switch (a.kind) {
    case "number": return a.value === (b as { kind: "number"; value: number }).value;
    case "string": return a.value === (b as { kind: "string"; value: string }).value;
    case "bool":   return a.value === (b as { kind: "bool"; value: boolean }).value;
    case "none":   return true;
    case "list": {
      const bList = b as { kind: "list"; items: Value[] };
      if (a.items.length !== bList.items.length) return false;
      return a.items.every((item, i) => valueEquals(item, bList.items[i]));
    }
    default: return false;
  }
}

export const NONE: Value = { kind: "none" };
export const TRUE: Value = { kind: "bool", value: true };
export const FALSE: Value = { kind: "bool", value: false };

export function numVal(n: number): Value { return { kind: "number", value: n }; }
export function strVal(s: string): Value { return { kind: "string", value: s }; }
export function boolVal(b: boolean): Value { return b ? TRUE : FALSE; }
export function listVal(items: Value[]): Value { return { kind: "list", items }; }
