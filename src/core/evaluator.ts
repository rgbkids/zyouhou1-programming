// AST Evaluator for the Jouhou-I runtime
// NOTE: Never uses JavaScript eval() or Function()

import type {
  Program, Stmt, Expr,
  BinOp as BinOpNode, UnaryOp as UnaryOpNode, Compare as CompareNode, BoolOp as BoolOpNode,
} from './ast';
import type { IOHooks } from './io';
import type { Value } from './value';
import {
  NONE, num, str, bool, list,
  isTruthy, valueToString,
  ReturnSignal, BreakSignal, ContinueSignal,
  type FunctionValue,
} from './value';
import { Environment } from './environment';

const MAX_LOOP_STEPS = 100_000;

export interface EvaluatorOptions {
  io: IOHooks;
  globals?: Record<string, Value>;
}

export function evaluate(program: Program, options: EvaluatorOptions): void {
  const env = new Environment();

  // Inject globals (builtins, webapi, device, etc.)
  if (options.globals) {
    for (const [name, val] of Object.entries(options.globals)) {
      env.set(name, val);
    }
  }

  for (const stmt of program.body) {
    execStmt(stmt, env, options.io);
  }
}

function execStmt(stmt: Stmt, env: Environment, io: IOHooks): void {
  switch (stmt.type) {
    case 'AssignStmt': {
      const val = evalExpr(stmt.value, env, io);
      env.set(stmt.target, val);
      break;
    }
    case 'PrintStmt': {
      const parts = stmt.args.map(a => valueToString(evalExpr(a, env, io)));
      io.print(parts.join(' '));
      break;
    }
    case 'IfStmt': {
      const cond = evalExpr(stmt.test, env, io);
      if (isTruthy(cond)) {
        for (const s of stmt.body) execStmt(s, env, io);
      } else {
        for (const s of stmt.orelse) execStmt(s, env, io);
      }
      break;
    }
    case 'ForStmt': {
      const iterVal = evalExpr(stmt.iter, env, io);
      const items = iterableToValues(iterVal, stmt.line);
      let steps = 0;
      for (const item of items) {
        if (++steps > MAX_LOOP_STEPS) {
          throw new RuntimeError(`Loop exceeded ${MAX_LOOP_STEPS} iterations`, stmt.line);
        }
        env.set(stmt.target, item);
        try {
          for (const s of stmt.body) execStmt(s, env, io);
        } catch (e) {
          if (e instanceof BreakSignal) break;
          if (e instanceof ContinueSignal) continue;
          throw e;
        }
      }
      break;
    }
    case 'WhileStmt': {
      let steps = 0;
      while (isTruthy(evalExpr(stmt.test, env, io))) {
        if (++steps > MAX_LOOP_STEPS) {
          throw new RuntimeError(`Loop exceeded ${MAX_LOOP_STEPS} iterations`, stmt.line);
        }
        try {
          for (const s of stmt.body) execStmt(s, env, io);
        } catch (e) {
          if (e instanceof BreakSignal) break;
          if (e instanceof ContinueSignal) continue;
          throw e;
        }
      }
      break;
    }
    case 'DefStmt': {
      const fn: FunctionValue = {
        type: 'function',
        name: stmt.name,
        params: stmt.params,
        body: stmt.body,
        closure: env,
      };
      env.set(stmt.name, fn);
      break;
    }
    case 'ReturnStmt': {
      const val = stmt.value ? evalExpr(stmt.value, env, io) : NONE;
      throw new ReturnSignal(val);
    }
    case 'ExprStmt': {
      evalExpr(stmt.expr, env, io);
      break;
    }
  }
}

function evalExpr(expr: Expr, env: Environment, io: IOHooks): Value {
  switch (expr.type) {
    case 'NumberLiteral': return num(expr.value);
    case 'StringLiteral': return str(expr.value);
    case 'BoolLiteral': return bool(expr.value);
    case 'NoneLiteral': return NONE;

    case 'Identifier': {
      try { return env.get(expr.name); }
      catch { throw new RuntimeError(`Name '${expr.name}' is not defined`, expr.line); }
    }

    case 'ListLiteral': {
      const elements = expr.elements.map(e => evalExpr(e, env, io));
      return list(elements);
    }

    case 'IndexAccess': {
      const target = evalExpr(expr.target, env, io);
      const index = evalExpr(expr.index, env, io);
      if (target.type !== 'list' && target.type !== 'string') {
        throw new RuntimeError(`Cannot index type '${target.type}'`, expr.line);
      }
      if (index.type !== 'number') {
        throw new RuntimeError('List index must be a number', expr.line);
      }
      const i = Math.trunc(index.value);
      if (target.type === 'list') {
        const len = target.elements.length;
        const idx = i < 0 ? len + i : i;
        if (idx < 0 || idx >= len) throw new RuntimeError(`Index ${i} out of range`, expr.line);
        return target.elements[idx];
      } else {
        const s = target.value;
        const idx = i < 0 ? s.length + i : i;
        if (idx < 0 || idx >= s.length) throw new RuntimeError(`Index ${i} out of range`, expr.line);
        return str(s[idx]);
      }
    }

    case 'AttributeAccess': {
      const obj = evalExpr(expr.object, env, io);
      if (obj.type === 'module') {
        if (expr.attr in obj.attrs) return obj.attrs[expr.attr];
        throw new RuntimeError(`Module '${obj.name}' has no attribute '${expr.attr}'`, expr.line);
      }
      throw new RuntimeError(`Cannot access attribute '${expr.attr}' on ${obj.type}`, expr.line);
    }

    case 'FuncCall': {
      // Special __setitem__ for list[index] = value
      if (expr.callee.type === 'Identifier' && expr.callee.name === '__setitem__') {
        const target = evalExpr(expr.args[0], env, io);
        const index = evalExpr(expr.args[1], env, io);
        const value = evalExpr(expr.args[2], env, io);
        if (target.type !== 'list') throw new RuntimeError('Cannot set index on non-list', expr.line);
        if (index.type !== 'number') throw new RuntimeError('Index must be a number', expr.line);
        const i = Math.trunc(index.value);
        const len = target.elements.length;
        const idx = i < 0 ? len + i : i;
        if (idx < 0 || idx >= len) throw new RuntimeError(`Index ${i} out of range`, expr.line);
        target.elements[idx] = value;
        return NONE;
      }

      const callee = evalExpr(expr.callee, env, io);
      const args = expr.args.map(a => evalExpr(a, env, io));

      if (callee.type === 'builtin') {
        return callee.call(args);
      }
      if (callee.type === 'function') {
        return callFunction(callee, args, io, expr.line);
      }
      throw new RuntimeError(`'${valueToString(callee)}' is not callable`, expr.line);
    }

    case 'BinOp': return evalBinOp(expr, env, io);
    case 'UnaryOp': return evalUnaryOp(expr, env, io);
    case 'Compare': return evalCompare(expr, env, io);
    case 'BoolOp': return evalBoolOp(expr, env, io);
  }
}

function callFunction(fn: FunctionValue, args: Value[], io: IOHooks, callLine: number): Value {
  if (fn.params.length !== args.length) {
    throw new RuntimeError(
      `${fn.name}() takes ${fn.params.length} arguments but ${args.length} were given`,
      callLine,
    );
  }
  const localEnv = fn.closure.extend();
  for (let i = 0; i < fn.params.length; i++) {
    localEnv.set(fn.params[i], args[i]);
  }
  try {
    for (const stmt of fn.body) execStmt(stmt, localEnv, io);
  } catch (e) {
    if (e instanceof ReturnSignal) return e.value;
    throw e;
  }
  return NONE;
}

function evalBinOp(expr: BinOpNode, env: Environment, io: IOHooks): Value {
  const left = evalExpr(expr.left, env, io);
  const right = evalExpr(expr.right, env, io);

  // String concatenation
  if (expr.op === '+' && left.type === 'string' && right.type === 'string') {
    return str(left.value + right.value);
  }
  // List concatenation
  if (expr.op === '+' && left.type === 'list' && right.type === 'list') {
    return list([...left.elements, ...right.elements]);
  }

  if (left.type !== 'number' || right.type !== 'number') {
    throw new RuntimeError(`Unsupported operand types for '${expr.op}': ${left.type} and ${right.type}`, expr.line);
  }
  const l = left.value, r = right.value;
  switch (expr.op) {
    case '+': return num(l + r);
    case '-': return num(l - r);
    case '*': return num(l * r);
    case '/': {
      if (r === 0) throw new RuntimeError('Division by zero', expr.line);
      return num(l / r);
    }
    case '//': {
      if (r === 0) throw new RuntimeError('Division by zero', expr.line);
      return num(Math.floor(l / r));
    }
    case '%': return num(((l % r) + r) % r);
    case '**': return num(Math.pow(l, r));
  }
}

function evalUnaryOp(expr: UnaryOpNode, env: Environment, io: IOHooks): Value {
  const operand = evalExpr(expr.operand, env, io);
  if (expr.op === '-') {
    if (operand.type !== 'number') throw new RuntimeError(`Unary '-' requires number`, expr.line);
    return num(-operand.value);
  }
  return bool(!isTruthy(operand));
}

function evalCompare(expr: CompareNode, env: Environment, io: IOHooks): Value {
  const left = evalExpr(expr.left, env, io);
  const right = evalExpr(expr.right, env, io);
  if (expr.op === '==' ) return bool(valuesEqual(left, right));
  if (expr.op === '!=' ) return bool(!valuesEqual(left, right));
  if (left.type !== 'number' || right.type !== 'number') {
    throw new RuntimeError(`Comparison '${expr.op}' requires numbers`, expr.line);
  }
  const l = left.value, r = right.value;
  switch (expr.op) {
    case '<': return bool(l < r);
    case '<=': return bool(l <= r);
    case '>': return bool(l > r);
    case '>=': return bool(l >= r);
  }
}

function evalBoolOp(expr: BoolOpNode, env: Environment, io: IOHooks): Value {
  const left = evalExpr(expr.left, env, io);
  if (expr.op === 'and') return isTruthy(left) ? evalExpr(expr.right, env, io) : left;
  // or
  return isTruthy(left) ? left : evalExpr(expr.right, env, io);
}

function valuesEqual(a: Value, b: Value): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'number' && b.type === 'number') return a.value === b.value;
  if (a.type === 'string' && b.type === 'string') return a.value === b.value;
  if (a.type === 'bool' && b.type === 'bool') return a.value === b.value;
  if (a.type === 'none' && b.type === 'none') return true;
  if (a.type === 'list' && b.type === 'list') {
    if (a.elements.length !== b.elements.length) return false;
    return a.elements.every((e, i) => valuesEqual(e, (b as typeof a).elements[i]));
  }
  return false;
}

function iterableToValues(val: Value, line: number): Value[] {
  if (val.type === 'list') return val.elements;
  if (val.type === 'string') return val.value.split('').map(c => str(c));
  throw new RuntimeError(`'${val.type}' is not iterable`, line);
}

export class RuntimeError extends Error {
  line: number;
  constructor(message: string, line: number) {
    super(`RuntimeError at line ${line}: ${message}`);
    this.line = line;
  }
}
