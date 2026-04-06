// Lexical environment (scope chain) for the Jouhou-I runtime

import type { Value } from './value';

export class Environment {
  private store: Map<string, Value>;
  private parent: Environment | null;

  constructor(parent: Environment | null = null) {
    this.store = new Map();
    this.parent = parent;
  }

  get(name: string): Value {
    if (this.store.has(name)) return this.store.get(name)!;
    if (this.parent) return this.parent.get(name);
    throw new ReferenceError(`Name '${name}' is not defined`);
  }

  set(name: string, value: Value): void {
    this.store.set(name, value);
  }

  /** Update existing variable (walks up scope chain) */
  update(name: string, value: Value): void {
    if (this.store.has(name)) {
      this.store.set(name, value);
      return;
    }
    if (this.parent) {
      this.parent.update(name, value);
      return;
    }
    // If not found anywhere, create in current scope (simple assignment semantics)
    this.store.set(name, value);
  }

  has(name: string): boolean {
    if (this.store.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }

  extend(): Environment {
    return new Environment(this);
  }
}
