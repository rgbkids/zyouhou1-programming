import type { Statement } from "../lang/ast";

export type PrimitiveValue = number | string | boolean | null;
export type RuntimeValue =
  | PrimitiveValue
  | RuntimeValue[]
  | RuntimeCallable
  | RuntimeObject;

export type RuntimeObject = {
  [key: string]: RuntimeValue;
};

export type RuntimeCallable = BuiltinCallable | UserFunctionValue;

export type BuiltinCallable = {
  kind: "builtin";
  name: string;
  call: (args: RuntimeValue[]) => RuntimeValue;
};

export type UserFunctionValue = {
  kind: "user-function";
  name: string;
  parameters: string[];
  body: Statement[];
  closure: unknown;
};

export function isCallable(value: RuntimeValue): value is RuntimeCallable {
  return typeof value === "object" && value !== null && "kind" in value;
}

export function isRuntimeObject(value: RuntimeValue): value is RuntimeObject {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !isCallable(value);
}

export function stringifyRuntimeValue(value: RuntimeValue): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stringifyRuntimeValue).join(", ")}]`;
  }
  if (isCallable(value)) {
    return `<function ${value.name}>`;
  }
  return JSON.stringify(value);
}
