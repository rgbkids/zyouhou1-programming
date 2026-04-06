import type { RuntimeValue } from "./value";

export class Environment {
  private readonly values = new Map<string, RuntimeValue>();
  readonly parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  define(name: string, value: RuntimeValue): RuntimeValue {
    this.values.set(name, value);
    return value;
  }

  assign(name: string, value: RuntimeValue): RuntimeValue {
    if (this.values.has(name)) {
      this.values.set(name, value);
      return value;
    }
    if (this.parent) {
      return this.parent.assign(name, value);
    }
    this.values.set(name, value);
    return value;
  }

  get(name: string): RuntimeValue {
    if (this.values.has(name)) {
      return this.values.get(name) as RuntimeValue;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    throw new Error(`Undefined variable: ${name}`);
  }

  hasLocal(name: string): boolean {
    return this.values.has(name);
  }
}
