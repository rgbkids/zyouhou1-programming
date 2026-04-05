// Control flow signals and loop guard for info1 runtime

import type { Value } from "./value";
import { NONE } from "./value";

// ─── Control flow signals ─────────────────────────────────────────────────────
// These are thrown as values (not Error objects) to interrupt normal execution.

export class ReturnSignal {
  constructor(public readonly value: Value = NONE) {}
}

export class BreakSignal {}

export class ContinueSignal {}

// ─── Loop guard ───────────────────────────────────────────────────────────────

export const MAX_LOOP_STEPS = 100_000;

export class LoopGuard {
  private steps = 0;

  tick(line?: number): void {
    this.steps++;
    if (this.steps > MAX_LOOP_STEPS) {
      throw new Error(
        line !== undefined
          ? `行 ${line}: 最大ループ回数 (${MAX_LOOP_STEPS.toLocaleString()}) を超えました（無限ループの可能性があります）`
          : `最大ループ回数 (${MAX_LOOP_STEPS.toLocaleString()}) を超えました`,
      );
    }
  }

  reset(): void { this.steps = 0; }
}
