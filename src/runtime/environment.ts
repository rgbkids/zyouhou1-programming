// Environment (variable store) for info1 language

import type { Value } from "./value";

export class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly line?: number,
    public readonly col?: number,
  ) {
    super(line !== undefined ? `行 ${line}: ${message}` : message);
    this.name = "RuntimeError";
  }
}

export class Environment {
  private vars = new Map<string, Value>();

  constructor(private readonly parent: Environment | null = null) {}

  get(name: string, line?: number, col?: number): Value {
    if (this.vars.has(name)) return this.vars.get(name)!;
    if (this.parent) return this.parent.get(name, line, col);
    throw new RuntimeError(`名前 "${name}" が定義されていません`, line, col);
  }

  set(name: string, value: Value): void {
    // Walk up to find an existing binding; if not found, set in current scope
    if (this.vars.has(name)) {
      this.vars.set(name, value);
      return;
    }
    if (this.parent && this.parent.has(name)) {
      this.parent.set(name, value);
      return;
    }
    this.vars.set(name, value);
  }

  define(name: string, value: Value): void {
    this.vars.set(name, value);
  }

  has(name: string): boolean {
    return this.vars.has(name) || (this.parent?.has(name) ?? false);
  }

  /** Create a child scope (for function calls) */
  child(): Environment {
    return new Environment(this);
  }
}
