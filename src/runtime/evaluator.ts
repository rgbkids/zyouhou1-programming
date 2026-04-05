// Tree-walking evaluator for info1 language
// No eval() or new Function() — pure AST interpretation

import type { Expr, Stmt, Program } from "../lang/ast";
import { Environment, RuntimeError } from "./environment";
import {
  Value, isTruthy, valueEquals, valueToString,
  numVal, strVal, boolVal, listVal, NONE,
} from "./value";
import {
  ReturnSignal, BreakSignal, ContinueSignal, LoopGuard,
} from "./control-flow";
import type { DeviceContext } from "./device";
import { makeBuiltins, setupGlobalEnv } from "./builtins";
import { IOBuffer } from "./io";

type Signal = ReturnSignal | BreakSignal | ContinueSignal | null;

export interface RunOptions {
  deviceCtx?: DeviceContext;
  useMockApi?: boolean;
  inputMock?: () => string;
  /** Max execution steps (default: 100_000) */
  maxSteps?: number;
}

export class Evaluator {
  private guard = new LoopGuard();

  constructor(
    private readonly io: IOBuffer,
    private readonly options: RunOptions = {},
  ) {}

  // ─── Public entry point ──────────────────────────────────────────────────

  async run(program: Program): Promise<void> {
    const env = new Environment();
    const builtins = makeBuiltins(
      (text) => this.io.stdout(text),
      this.options.inputMock ?? (() => ""),
      this.options.deviceCtx,
      this.options.useMockApi ?? false,
    );
    setupGlobalEnv(env, builtins);
    this.guard.reset();
    await this.execBlock(env, program.stmts);
  }

  // ─── Block / Statement execution ─────────────────────────────────────────

  private async execBlock(env: Environment, stmts: Stmt[]): Promise<Signal> {
    for (const stmt of stmts) {
      const sig = await this.execStmt(env, stmt);
      if (sig !== null) return sig;
    }
    return null;
  }

  private async execStmt(env: Environment, stmt: Stmt): Promise<Signal> {
    switch (stmt.kind) {

      case "assign": {
        const val = await this.evalExpr(env, stmt.value);
        env.set(stmt.target, val);
        return null;
      }

      case "index_assign": {
        const obj = await this.evalExpr(env, stmt.obj);
        const idx = await this.evalExpr(env, stmt.idx);
        const val = await this.evalExpr(env, stmt.value);
        if (obj.kind !== "list") throw new RuntimeError("添字代入はリストにのみ使えます", stmt.pos.line);
        const i = this.toListIndex(idx, obj.items.length, stmt.pos.line);
        obj.items[i] = val;
        return null;
      }

      case "expr_stmt": {
        await this.evalExpr(env, stmt.expr);
        return null;
      }

      case "if": {
        const cond = await this.evalExpr(env, stmt.cond);
        if (isTruthy(cond)) {
          return this.execBlock(env, stmt.then);
        }
        for (const elif of stmt.elifs) {
          const ec = await this.evalExpr(env, elif.cond);
          if (isTruthy(ec)) return this.execBlock(env, elif.body);
        }
        if (stmt.else_.length > 0) return this.execBlock(env, stmt.else_);
        return null;
      }

      case "for": {
        const iterVal = await this.evalExpr(env, stmt.iter);
        const items = this.toIterable(iterVal, stmt.pos.line);
        for (const item of items) {
          this.guard.tick(stmt.pos.line);
          env.set(stmt.var_, item);
          const sig = await this.execBlock(env, stmt.body);
          if (sig instanceof BreakSignal)    break;
          if (sig instanceof ReturnSignal)   return sig;
          // ContinueSignal: just continue the loop
        }
        return null;
      }

      case "while": {
        while (true) {
          this.guard.tick(stmt.pos.line);
          const cond = await this.evalExpr(env, stmt.cond);
          if (!isTruthy(cond)) break;
          const sig = await this.execBlock(env, stmt.body);
          if (sig instanceof BreakSignal)    break;
          if (sig instanceof ReturnSignal)   return sig;
        }
        return null;
      }

      case "def": {
        const fn: Value = {
          kind: "function",
          name: stmt.name,
          params: stmt.params,
          body: stmt.body,
          closure: env,
        };
        env.define(stmt.name, fn);
        return null;
      }

      case "return": {
        const val = stmt.value ? await this.evalExpr(env, stmt.value) : NONE;
        return new ReturnSignal(val);
      }

      case "break":    return new BreakSignal();
      case "continue": return new ContinueSignal();
      case "pass":     return null;
    }
  }

  // ─── Expression evaluation ────────────────────────────────────────────────

  private async evalExpr(env: Environment, expr: Expr): Promise<Value> {
    switch (expr.kind) {

      case "number": return numVal(expr.value);
      case "string": return strVal(expr.value);
      case "bool":   return boolVal(expr.value);
      case "none":   return NONE;

      case "name":
        return env.get(expr.name, expr.pos.line, expr.pos.col);

      case "list": {
        const items = await Promise.all(expr.items.map((e) => this.evalExpr(env, e)));
        return listVal(items);
      }

      case "index": {
        const obj = await this.evalExpr(env, expr.obj);
        const idx = await this.evalExpr(env, expr.idx);
        if (obj.kind === "list") {
          const i = this.toListIndex(idx, obj.items.length, expr.pos.line);
          return obj.items[i];
        }
        if (obj.kind === "string") {
          const i = this.toListIndex(idx, obj.value.length, expr.pos.line);
          return strVal(obj.value[i]);
        }
        throw new RuntimeError("添字アクセスはリストまたは文字列にのみ使えます", expr.pos.line);
      }

      case "attr": {
        const obj = await this.evalExpr(env, expr.obj);
        if (obj.kind === "module") {
          const attr = obj.attrs[expr.attr];
          if (attr === undefined) {
            throw new RuntimeError(`モジュール "${obj.name}" に "${expr.attr}" はありません`, expr.pos.line);
          }
          return attr;
        }
        throw new RuntimeError(`"${expr.attr}" 属性にアクセスできません`, expr.pos.line);
      }

      case "call": {
        const fn = await this.evalExpr(env, expr.func);
        const args = await Promise.all(expr.args.map((a) => this.evalExpr(env, a)));
        return this.callValue(fn, args, expr.pos.line);
      }

      case "unop": {
        const operand = await this.evalExpr(env, expr.operand);
        if (expr.op === "neg") {
          if (operand.kind !== "number") {
            throw new RuntimeError("単項マイナスは数値にのみ使えます", expr.pos.line);
          }
          return numVal(-operand.value);
        }
        // "not"
        return boolVal(!isTruthy(operand));
      }

      case "binop":
        return this.evalBinop(env, expr);
    }
  }

  private async evalBinop(env: Environment, expr: Extract<Expr, { kind: "binop" }>): Promise<Value> {
    // Short-circuit for and/or
    if (expr.op === "and") {
      const left = await this.evalExpr(env, expr.left);
      if (!isTruthy(left)) return left;
      return this.evalExpr(env, expr.right);
    }
    if (expr.op === "or") {
      const left = await this.evalExpr(env, expr.left);
      if (isTruthy(left)) return left;
      return this.evalExpr(env, expr.right);
    }

    const left  = await this.evalExpr(env, expr.left);
    const right = await this.evalExpr(env, expr.right);
    const line  = expr.pos.line;

    switch (expr.op) {
      case "+":
        if (left.kind === "number" && right.kind === "number") return numVal(left.value + right.value);
        if (left.kind === "string" && right.kind === "string") return strVal(left.value + right.value);
        // Allow str + number or number + str as string concat
        if (left.kind === "string" || right.kind === "string") {
          return strVal(valueToString(left) + valueToString(right));
        }
        throw new RuntimeError("+ は数値同士か文字列同士にのみ使えます", line);
      case "-":  return numVal(this.numOf(left, line) - this.numOf(right, line));
      case "*":  return numVal(this.numOf(left, line) * this.numOf(right, line));
      case "/": {
        const r = this.numOf(right, line);
        if (r === 0) throw new RuntimeError("0除算はできません", line);
        return numVal(this.numOf(left, line) / r);
      }
      case "//": {
        const r = this.numOf(right, line);
        if (r === 0) throw new RuntimeError("0除算はできません", line);
        return numVal(Math.trunc(this.numOf(left, line) / r));
      }
      case "%": {
        const r = this.numOf(right, line);
        if (r === 0) throw new RuntimeError("0除算はできません", line);
        return numVal(this.numOf(left, line) % r);
      }
      case "**": return numVal(Math.pow(this.numOf(left, line), this.numOf(right, line)));
      case "==": return boolVal(valueEquals(left, right));
      case "!=": return boolVal(!valueEquals(left, right));
      case "<":  return boolVal(this.numOf(left, line) <  this.numOf(right, line));
      case "<=": return boolVal(this.numOf(left, line) <= this.numOf(right, line));
      case ">":  return boolVal(this.numOf(left, line) >  this.numOf(right, line));
      case ">=": return boolVal(this.numOf(left, line) >= this.numOf(right, line));
    }
  }

  // ─── Function call ────────────────────────────────────────────────────────

  private async callValue(fn: Value, args: Value[], line: number): Promise<Value> {
    if (fn.kind === "builtin") {
      const result = await fn.fn(args);
      return result;
    }

    if (fn.kind === "function") {
      if (args.length !== fn.params.length) {
        throw new RuntimeError(
          `関数 "${fn.name}" は引数 ${fn.params.length} 個が必要ですが ${args.length} 個が渡されました`,
          line,
        );
      }
      const localEnv = fn.closure.child();
      for (let i = 0; i < fn.params.length; i++) {
        localEnv.define(fn.params[i], args[i]);
      }
      const sig = await this.execBlock(localEnv, fn.body);
      if (sig instanceof ReturnSignal) return sig.value;
      return NONE;
    }

    throw new RuntimeError(`"${valueToString(fn)}" は関数ではありません`, line);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private numOf(v: Value, line: number): number {
    if (v.kind === "number") return v.value;
    if (v.kind === "bool")   return v.value ? 1 : 0;
    throw new RuntimeError(`数値が必要です（${v.kind} が来ました）`, line);
  }

  private toListIndex(idx: Value, length: number, line: number): number {
    if (idx.kind !== "number") throw new RuntimeError("添字は整数が必要です", line);
    let i = Math.trunc(idx.value);
    if (i < 0) i = length + i; // negative indexing
    if (i < 0 || i >= length) {
      throw new RuntimeError(`添字 ${Math.trunc(idx.value)} は範囲外です（長さ ${length}）`, line);
    }
    return i;
  }

  private toIterable(v: Value, line: number): Value[] {
    if (v.kind === "list")   return v.items;
    if (v.kind === "string") return v.value.split("").map(strVal);
    throw new RuntimeError(`for ループはリストまたは文字列のみ反復できます（${v.kind} が来ました）`, line);
  }
}

// ─── Convenience: parse + run ────────────────────────────────────────────────

import { parse, ParseError, TokenizeError } from "../lang/parser";

export interface RunResult {
  output: ReturnType<IOBuffer["getLines"]>;
  error: string | null;
}

export async function runCode(
  source: string,
  options: RunOptions = {},
): Promise<RunResult> {
  const io = new IOBuffer();
  try {
    const program = parse(source);
    const evaluator = new Evaluator(io, options);
    await evaluator.run(program);
    return { output: io.getLines(), error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    io.stderr(msg);
    return { output: io.getLines(), error: msg };
  }
}
