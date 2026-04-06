// AST evaluator for the Info-I language subset

import type { Program, Stmt, Expr } from '../lang/ast.js';
import { Environment } from './environment.js';
import type { RuntimeInterface } from './io.js';
import {
  Value, repr, isTruthy,
  numVal, strVal, boolVal, listVal,
  NONE, TRUE, FALSE,
} from './value.js';

const MAX_STEPS = 100_000;

// ─── Control flow signals ────────────────────────────────────────────────────

class ReturnSignal { constructor(public value: Value) {} }
class BreakSignal {}
class ContinueSignal {}

// ─── Runtime error ───────────────────────────────────────────────────────────

export class RuntimeError extends Error {
  constructor(msg: string, public line?: number, public col?: number) {
    const loc = line != null ? ` [行${line}:列${col ?? 1}]` : '';
    super(msg + loc);
  }
}

// ─── Evaluator ───────────────────────────────────────────────────────────────

export class Evaluator {
  private steps = 0;
  private env: Environment;

  constructor(private runtime: RuntimeInterface) {
    this.env = new Environment();
    this.installBuiltins();
  }

  // ─── Builtins ──────────────────────────────────────────────────────────────

  private installBuiltins(): void {
    const rt = this.runtime;

    this.env.set('print', {
      type: 'builtin', name: 'print',
      fn: (...args) => {
        rt.print(args.map(repr).join(' '));
        return NONE;
      },
    });

    this.env.set('len', {
      type: 'builtin', name: 'len',
      fn: (a) => {
        if (a.type === 'list') return numVal(a.v.length);
        if (a.type === 'string') return numVal(a.v.length);
        throw new RuntimeError('len() はリストまたは文字列に使えます');
      },
    });

    this.env.set('int', {
      type: 'builtin', name: 'int',
      fn: (a) => {
        if (a.type === 'number') return numVal(Math.trunc(a.v));
        if (a.type === 'string') {
          const n = parseInt(a.v, 10);
          if (isNaN(n)) throw new RuntimeError(`int() に変換できません: "${a.v}"`);
          return numVal(n);
        }
        if (a.type === 'bool') return numVal(a.v ? 1 : 0);
        throw new RuntimeError('int() の引数が不正です');
      },
    });

    this.env.set('float', {
      type: 'builtin', name: 'float',
      fn: (a) => {
        if (a.type === 'number') return numVal(a.v);
        if (a.type === 'string') {
          const n = parseFloat(a.v);
          if (isNaN(n)) throw new RuntimeError(`float() に変換できません: "${a.v}"`);
          return numVal(n);
        }
        throw new RuntimeError('float() の引数が不正です');
      },
    });

    this.env.set('str', {
      type: 'builtin', name: 'str',
      fn: (a) => strVal(repr(a)),
    });

    // range() returns a special list value
    this.env.set('range', {
      type: 'builtin', name: 'range',
      fn: (...args) => {
        let start = 0, stop = 0, step = 1;
        if (args.length === 1) {
          stop = requireNumber(args[0]!, 'range');
        } else if (args.length === 2) {
          start = requireNumber(args[0]!, 'range'); stop = requireNumber(args[1]!, 'range');
        } else if (args.length === 3) {
          start = requireNumber(args[0]!, 'range'); stop = requireNumber(args[1]!, 'range');
          step = requireNumber(args[2]!, 'range');
        }
        if (step === 0) throw new RuntimeError('range() の step に 0 は使えません');
        const items: Value[] = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
          items.push(numVal(i));
        }
        return listVal(items);
      },
    });

    // random module object (accessed as random.randrange)
    this.env.set('random', {
      type: 'builtin', name: 'random',
      fn: () => NONE,
    });

    // webapi module
    this.env.set('webapi', {
      type: 'builtin', name: 'webapi',
      fn: () => NONE,
    });

    // device module
    this.env.set('device', {
      type: 'builtin', name: 'device',
      fn: () => NONE,
    });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  run(program: Program): void {
    this.steps = 0;
    this.execStmts(program.body, this.env);
  }

  // ─── Statement execution ───────────────────────────────────────────────────

  private execStmts(stmts: Stmt[], env: Environment): void | ReturnSignal | BreakSignal | ContinueSignal {
    for (const stmt of stmts) {
      const sig = this.execStmt(stmt, env);
      if (sig instanceof ReturnSignal || sig instanceof BreakSignal || sig instanceof ContinueSignal) {
        return sig;
      }
    }
  }

  private execStmt(stmt: Stmt, env: Environment): void | ReturnSignal | BreakSignal | ContinueSignal {
    this.tick();

    switch (stmt.kind) {
      case 'Assign': {
        const val = this.evalExpr(stmt.value, env);
        if (stmt.target.kind === 'Name') {
          env.assign(stmt.target.id, val);
        } else {
          // Subscript assignment
          const list = this.evalExpr(stmt.target.value, env);
          const idx = this.evalExpr(stmt.target.index, env);
          if (list.type !== 'list') throw new RuntimeError('添字代入はリストにのみ使えます', stmt.pos.line, stmt.pos.col);
          const i = requireNumber(idx, '添字');
          const ii = normalizeIndex(i, list.v.length, stmt.pos.line);
          list.v[ii] = val;
        }
        break;
      }

      case 'AugAssign': {
        const current = env.get(stmt.target.id);
        if (current === undefined) throw new RuntimeError(`変数 '${stmt.target.id}' が未定義です`, stmt.pos.line);
        const rhs = this.evalExpr(stmt.value, env);
        if (current.type !== 'number' || rhs.type !== 'number') {
          throw new RuntimeError('複合代入演算子は数値のみ使えます', stmt.pos.line);
        }
        const result = stmt.op === '+' ? current.v + rhs.v : current.v - rhs.v;
        env.assign(stmt.target.id, numVal(result));
        break;
      }

      case 'ExprStmt': {
        this.evalExpr(stmt.expr, env);
        break;
      }

      case 'If': {
        const cond = this.evalExpr(stmt.test, env);
        if (isTruthy(cond)) {
          return this.execStmts(stmt.body, env);
        } else if (stmt.orelse.length > 0) {
          return this.execStmts(stmt.orelse, env);
        }
        break;
      }

      case 'For': {
        const rangeVal = this.evalRange(stmt.rangeArgs, env);
        for (const item of rangeVal) {
          this.tick();
          env.assign(stmt.target, item);
          const sig = this.execStmts(stmt.body, env);
          if (sig instanceof ReturnSignal) return sig;
          if (sig instanceof BreakSignal) break;
          // ContinueSignal: continue to next iteration
        }
        break;
      }

      case 'While': {
        while (isTruthy(this.evalExpr(stmt.test, env))) {
          this.tick();
          const sig = this.execStmts(stmt.body, env);
          if (sig instanceof ReturnSignal) return sig;
          if (sig instanceof BreakSignal) break;
        }
        break;
      }

      case 'FuncDef': {
        env.assign(stmt.name, {
          type: 'function',
          name: stmt.name,
          params: stmt.params,
          body: stmt.body,
          closure: env,
        });
        break;
      }

      case 'Return': {
        const val = stmt.value ? this.evalExpr(stmt.value, env) : NONE;
        return new ReturnSignal(val);
      }

      case 'Break':
        return new BreakSignal();

      case 'Continue':
        return new ContinueSignal();
    }
  }

  private evalRange(args: Expr[], env: Environment): Value[] {
    const nums = args.map(a => requireNumber(this.evalExpr(a, env), 'range'));
    let start = 0, stop = 0, step = 1;
    if (nums.length === 1) { stop = nums[0]!; }
    else if (nums.length === 2) { start = nums[0]!; stop = nums[1]!; }
    else if (nums.length === 3) { start = nums[0]!; stop = nums[1]!; step = nums[2]!; }
    if (step === 0) throw new RuntimeError('range() の step に 0 は使えません');
    const items: Value[] = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      items.push(numVal(i));
    }
    return items;
  }

  // ─── Expression evaluation ─────────────────────────────────────────────────

  private evalExpr(expr: Expr, env: Environment): Value {
    this.tick();

    switch (expr.kind) {
      case 'Number': return numVal(expr.value);
      case 'String': return strVal(expr.value);
      case 'Bool': return boolVal(expr.value);
      case 'None': return NONE;

      case 'List': {
        const items = expr.elements.map(e => this.evalExpr(e, env));
        return listVal(items);
      }

      case 'Name': {
        const v = env.get(expr.id);
        if (v === undefined) {
          throw new RuntimeError(`変数 '${expr.id}' が未定義です`, expr.pos.line, expr.pos.col);
        }
        return v;
      }

      case 'BinOp': return this.evalBinOp(expr, env);
      case 'UnaryOp': return this.evalUnaryOp(expr, env);
      case 'Compare': return this.evalCompare(expr, env);
      case 'BoolOp': return this.evalBoolOp(expr, env);

      case 'Call': return this.evalCall(expr, env);

      case 'Subscript': {
        const val = this.evalExpr(expr.value, env);
        const idx = this.evalExpr(expr.index, env);
        if (val.type === 'list') {
          const i = normalizeIndex(requireNumber(idx, '添字'), val.v.length, expr.pos.line);
          return val.v[i]!;
        }
        if (val.type === 'string') {
          const i = normalizeIndex(requireNumber(idx, '添字'), val.v.length, expr.pos.line);
          return strVal(val.v[i]!);
        }
        throw new RuntimeError('添字アクセスはリストまたは文字列にのみ使えます', expr.pos.line);
      }

      case 'Attribute': {
        // module.attr access — returns a bound lookup for call resolution
        const obj = this.evalExpr(expr.value, env);
        if (obj.type === 'builtin') {
          // Return a sentinel that call handler will resolve
          return { type: 'builtin', name: `${obj.name}.${expr.attr}`, fn: () => NONE };
        }
        throw new RuntimeError(`属性アクセス '${expr.attr}' はサポートされていません`, expr.pos.line);
      }
    }
  }

  private evalBinOp(expr: import('../lang/ast.js').BinOp, env: Environment): Value {
    const l = this.evalExpr(expr.left, env);
    const r = this.evalExpr(expr.right, env);

    if (expr.op === '+') {
      if (l.type === 'string' && r.type === 'string') return strVal(l.v + r.v);
      if (l.type === 'list' && r.type === 'list') return listVal([...l.v, ...r.v]);
      return numVal(requireNumber(l, '+') + requireNumber(r, '+'));
    }
    if (expr.op === '-') return numVal(requireNumber(l, '-') - requireNumber(r, '-'));
    if (expr.op === '*') {
      if (l.type === 'string' && r.type === 'number') return strVal(l.v.repeat(Math.max(0, r.v)));
      return numVal(requireNumber(l, '*') * requireNumber(r, '*'));
    }
    if (expr.op === '/') {
      const d = requireNumber(r, '/');
      if (d === 0) throw new RuntimeError('ゼロ除算', expr.pos.line);
      return numVal(requireNumber(l, '/') / d);
    }
    if (expr.op === '//') {
      const d = requireNumber(r, '//');
      if (d === 0) throw new RuntimeError('ゼロ除算', expr.pos.line);
      return numVal(Math.floor(requireNumber(l, '//') / d));
    }
    if (expr.op === '%') {
      const d = requireNumber(r, '%');
      if (d === 0) throw new RuntimeError('ゼロ除算', expr.pos.line);
      return numVal(requireNumber(l, '%') % d);
    }
    if (expr.op === '**') return numVal(Math.pow(requireNumber(l, '**'), requireNumber(r, '**')));

    throw new RuntimeError(`不明な演算子: ${expr.op}`);
  }

  private evalUnaryOp(expr: import('../lang/ast.js').UnaryOp, env: Environment): Value {
    const v = this.evalExpr(expr.operand, env);
    if (expr.op === '-') return numVal(-requireNumber(v, '単項-'));
    if (expr.op === 'not') return boolVal(!isTruthy(v));
    throw new RuntimeError(`不明な単項演算子: ${expr.op}`);
  }

  private evalCompare(expr: import('../lang/ast.js').Compare, env: Environment): Value {
    let left = this.evalExpr(expr.left, env);
    for (let i = 0; i < expr.ops.length; i++) {
      const right = this.evalExpr(expr.comparators[i]!, env);
      const op = expr.ops[i]!;
      if (!compare(op, left, right)) return FALSE;
      left = right;
    }
    return TRUE;
  }

  private evalBoolOp(expr: import('../lang/ast.js').BoolOp, env: Environment): Value {
    if (expr.op === 'and') {
      let last: Value = TRUE;
      for (const v of expr.values) {
        last = this.evalExpr(v, env);
        if (!isTruthy(last)) return last;
      }
      return last;
    } else {
      let last: Value = FALSE;
      for (const v of expr.values) {
        last = this.evalExpr(v, env);
        if (isTruthy(last)) return last;
      }
      return last;
    }
  }

  private evalCall(expr: import('../lang/ast.js').Call, env: Environment): Value {
    const func = this.evalExpr(expr.func, env);
    const args = expr.args.map(a => this.evalExpr(a, env));

    if (func.type === 'builtin') {
      // Handle module method calls (e.g., random.randrange, device.led_show)
      const name = func.name;

      if (name === 'random.randrange') {
        let start = 0, stop = 0;
        if (args.length === 1) { stop = requireNumber(args[0]!, 'random.randrange'); }
        else if (args.length >= 2) { start = requireNumber(args[0]!, 'random.randrange'); stop = requireNumber(args[1]!, 'random.randrange'); }
        return numVal(this.runtime.random(start, stop));
      }

      if (name === 'device.accelerometer_x') return numVal(this.runtime.deviceGet('accelerometer_x'));
      if (name === 'device.temperature') return numVal(this.runtime.deviceGet('temperature'));
      if (name === 'device.light_level') return numVal(this.runtime.deviceGet('light_level'));
      if (name === 'device.led_show') {
        const text = args[0] ? repr(args[0]) : '';
        this.runtime.deviceShow(text);
        return NONE;
      }
      if (name === 'device.led_clear') { this.runtime.deviceClear(); return NONE; }

      if (name === 'webapi.get_json') {
        // Sync stub — async not supported in this evaluator version
        throw new RuntimeError('webapi.get_json() は現在のモードでは使えません');
      }

      return func.fn(...args);
    }

    if (func.type === 'function') {
      if (args.length !== func.params.length) {
        throw new RuntimeError(
          `関数 '${func.name}' の引数が合いません: ${func.params.length} 個必要, ${args.length} 個渡された`,
          expr.pos.line
        );
      }
      const localEnv = func.closure.child();
      for (let i = 0; i < func.params.length; i++) {
        localEnv.set(func.params[i]!, args[i]!);
      }
      const sig = this.execStmts(func.body, localEnv);
      if (sig instanceof ReturnSignal) return sig.value;
      return NONE;
    }

    throw new RuntimeError(`呼び出せないオブジェクト: ${repr(func)}`, expr.pos.line);
  }

  // ─── Step counter ──────────────────────────────────────────────────────────

  private tick(): void {
    this.steps++;
    if (this.steps > MAX_STEPS) {
      throw new RuntimeError(`実行ステップ上限 (${MAX_STEPS}) に達しました。無限ループの可能性があります。`);
    }
    this.runtime.checkStep();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requireNumber(v: Value, op: string): number {
  if (v.type === 'number') return v.v;
  if (v.type === 'bool') return v.v ? 1 : 0;
  throw new RuntimeError(`演算子 '${op}' には数値が必要です (${v.type} が渡された)`);
}

function normalizeIndex(i: number, length: number, line?: number): number {
  const idx = i < 0 ? length + i : i;
  if (idx < 0 || idx >= length) {
    throw new RuntimeError(`添字 ${i} は範囲外です (長さ: ${length})`, line);
  }
  return idx;
}

function compare(op: string, l: Value, r: Value): boolean {
  if (op === '==' || op === '!=') {
    const eq = valEqual(l, r);
    return op === '==' ? eq : !eq;
  }
  const lv = toComparable(l);
  const rv = toComparable(r);
  if (op === '<') return lv < rv;
  if (op === '>') return lv > rv;
  if (op === '<=') return lv <= rv;
  if (op === '>=') return lv >= rv;
  return false;
}

function valEqual(l: Value, r: Value): boolean {
  if (l.type !== r.type) {
    // number vs bool cross-comparison
    if ((l.type === 'number' || l.type === 'bool') && (r.type === 'number' || r.type === 'bool')) {
      return toNum(l) === toNum(r);
    }
    return false;
  }
  if (l.type === 'number' && r.type === 'number') return l.v === r.v;
  if (l.type === 'string' && r.type === 'string') return l.v === r.v;
  if (l.type === 'bool' && r.type === 'bool') return l.v === r.v;
  if (l.type === 'none' && r.type === 'none') return true;
  if (l.type === 'list' && r.type === 'list') {
    if (l.v.length !== r.v.length) return false;
    return l.v.every((v, i) => valEqual(v, r.v[i]!));
  }
  return false;
}

function toComparable(v: Value): number | string {
  if (v.type === 'number') return v.v;
  if (v.type === 'bool') return v.v ? 1 : 0;
  if (v.type === 'string') return v.v;
  throw new RuntimeError(`この型は比較できません: ${v.type}`);
}

function toNum(v: Value): number {
  if (v.type === 'number') return v.v;
  if (v.type === 'bool') return v.v ? 1 : 0;
  return NaN;
}

// ─── Public run helper ───────────────────────────────────────────────────────

import { parse, ParseError } from '../lang/parser.js';
import { OutputBuffer, makeDefaultRuntime } from './io.js';

export interface RunResult {
  output: readonly import('./io.js').OutputLine[];
  error: string | null;
  errorLine?: number;
}

export function runCode(source: string, seed?: number): RunResult {
  const buf = new OutputBuffer();
  const rt = makeDefaultRuntime(buf, seed);

  let program;
  try {
    program = parse(source);
  } catch (e) {
    const pe = e as ParseError;
    return { output: [], error: pe.message, errorLine: pe.line };
  }

  try {
    const evaluator = new Evaluator(rt);
    evaluator.run(program);
    return { output: buf.getLines(), error: null };
  } catch (e) {
    const re = e as RuntimeError;
    const output = buf.getLines();
    return { output, error: re.message, errorLine: re.line };
  }
}

export function runCodeWithRuntime(source: string, rt: RuntimeInterface, buf: OutputBuffer): RunResult {
  let program;
  try {
    program = parse(source);
  } catch (e) {
    const pe = e as ParseError;
    return { output: [], error: pe.message, errorLine: pe.line };
  }

  try {
    const evaluator = new Evaluator(rt);
    evaluator.run(program);
    return { output: buf.getLines(), error: null };
  } catch (e) {
    const re = e as RuntimeError;
    return { output: buf.getLines(), error: re.message, errorLine: re.line };
  }
}
