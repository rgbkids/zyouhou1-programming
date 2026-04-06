// Scope / environment chain

import type { Value } from './value.js';

export class Environment {
  private store: Map<string, Value> = new Map();

  constructor(public parent: Environment | null = null) {}

  get(name: string): Value | undefined {
    if (this.store.has(name)) return this.store.get(name)!;
    if (this.parent) return this.parent.get(name);
    return undefined;
  }

  set(name: string, value: Value): void {
    this.store.set(name, value);
  }

  /** Assign a variable in the current scope (Python-like: assignment always creates/updates local) */
  assign(name: string, value: Value): void {
    this.store.set(name, value);
  }

  has(name: string): boolean {
    if (this.store.has(name)) return true;
    if (this.parent) return this.parent.has(name);
    return false;
  }

  child(): Environment {
    return new Environment(this);
  }
}
