import type {
  AssignmentStatement,
  BinaryExpression,
  CallExpression,
  Expression,
  ForStatement,
  FunctionDefinition,
  Identifier,
  IfStatement,
  IndexExpression,
  MemberExpression,
  PrintStatement,
  Program,
  ReturnStatement,
  Statement,
  UnaryExpression,
  WhileStatement,
} from "../lang/ast";
import { parse } from "../lang/parser";
import { Environment } from "./environment";
import {
  isCallable,
  isRuntimeObject,
  stringifyRuntimeValue,
  type BuiltinCallable,
  type RuntimeCallable,
  type RuntimeObject,
  type RuntimeValue,
  type UserFunctionValue,
} from "./value";

export type RuntimeHooks = {
  print: (...values: RuntimeValue[]) => void;
  randomRange: (stop: number) => number;
  webapiGetJson: (name: string, params: RuntimeValue[]) => RuntimeValue;
  device: Record<string, (...args: RuntimeValue[]) => RuntimeValue>;
  maxWhileSteps: number;
};

export type EvaluationResult = {
  environment: Environment;
  outputs: string[];
  lastValue: RuntimeValue;
};

export class RuntimeError extends Error {}

type ControlSignal = {
  type: "return";
  value: RuntimeValue;
};

export class Evaluator {
  private readonly hooks: RuntimeHooks;
  private readonly outputBuffer: string[] = [];

  constructor(hooks?: Partial<RuntimeHooks>) {
    this.hooks = {
      print: (...values) => {
        this.outputBuffer.push(values.map(stringifyRuntimeValue).join(" "));
      },
      randomRange: (stop) => Math.floor(Math.random() * stop),
      webapiGetJson: (name, params) => ({ name, params }),
      device: {},
      maxWhileSteps: 10_000,
      ...hooks,
    };
  }

  evaluate(program: Program, environment = this.createGlobalEnvironment()): EvaluationResult {
    let lastValue: RuntimeValue = null;

    for (const statement of program.body) {
      const result = this.execute(statement, environment);
      if (isControlSignal(result)) {
        throw new RuntimeError("return can only be used inside a function");
      }
      lastValue = result;
    }

    return {
      environment,
      outputs: [...this.outputBuffer],
      lastValue,
    };
  }

  run(source: string, environment = this.createGlobalEnvironment()): EvaluationResult {
    return this.evaluate(parse(source), environment);
  }

  createGlobalEnvironment(): Environment {
    const environment = new Environment();

    environment.define(
      "len",
      this.createBuiltin("len", (args) => {
        if (args.length !== 1 || !Array.isArray(args[0])) {
          throw new RuntimeError("len expects exactly one list argument");
        }
        return args[0].length;
      }),
    );

    environment.define(
      "range",
      this.createBuiltin("range", (args) => {
        if (args.length !== 3) {
          throw new RuntimeError("range expects exactly 3 arguments");
        }
        const [start, stop, step] = args;
        assertNumber(start, "range start");
        assertNumber(stop, "range stop");
        assertNumber(step, "range step");
        if (step === 0) {
          throw new RuntimeError("range step must not be 0");
        }
        const values: RuntimeValue[] = [];
        if (step > 0) {
          for (let value = start; value < stop; value += step) {
            values.push(value);
          }
        } else {
          for (let value = start; value > stop; value += step) {
            values.push(value);
          }
        }
        return values;
      }),
    );

    environment.define(
      "random",
      this.createModule({
        randrange: this.createBuiltin("random.randrange", (args) => {
          if (args.length !== 1) {
            throw new RuntimeError("random.randrange expects exactly 1 argument");
          }
          const [stop] = args;
          assertNumber(stop, "random.randrange stop");
          return this.hooks.randomRange(stop);
        }),
      }),
    );

    environment.define(
      "webapi",
      this.createModule({
        get_json: this.createBuiltin("webapi.get_json", (args) => {
          if (args.length < 1) {
            throw new RuntimeError("webapi.get_json expects at least 1 argument");
          }
          const [name, ...rest] = args;
          if (typeof name !== "string") {
            throw new RuntimeError("webapi.get_json name must be a string");
          }
          return this.hooks.webapiGetJson(name, rest);
        }),
      }),
    );

    const deviceModule: RuntimeObject = {};
    for (const [name, fn] of Object.entries(this.hooks.device)) {
      deviceModule[name] = this.createBuiltin(`device.${name}`, fn);
    }
    environment.define("device", deviceModule);

    return environment;
  }

  private execute(statement: Statement, environment: Environment): RuntimeValue | ControlSignal {
    switch (statement.type) {
      case "AssignmentStatement":
        return this.executeAssignment(statement, environment);
      case "ExpressionStatement":
        return this.evaluateExpression(statement.expression, environment);
      case "PrintStatement":
        return this.executePrint(statement, environment);
      case "ReturnStatement":
        return this.executeReturn(statement, environment);
      case "IfStatement":
        return this.executeIf(statement, environment);
      case "ForStatement":
        return this.executeFor(statement, environment);
      case "WhileStatement":
        return this.executeWhile(statement, environment);
      case "FunctionDefinition":
        return this.executeFunctionDefinition(statement, environment);
    }
  }

  private executeAssignment(statement: AssignmentStatement, environment: Environment): RuntimeValue {
    const value = this.evaluateExpression(statement.value, environment);
    environment.assign(statement.target.name, value);
    return value;
  }

  private executePrint(statement: PrintStatement, environment: Environment): RuntimeValue {
    const values = statement.arguments.map((arg) => this.evaluateExpression(arg, environment));
    this.hooks.print(...values);
    return null;
  }

  private executeReturn(statement: ReturnStatement, environment: Environment): ControlSignal {
    return {
      type: "return",
      value: this.evaluateExpression(statement.value, environment),
    };
  }

  private executeIf(statement: IfStatement, environment: Environment): RuntimeValue | ControlSignal {
    if (isTruthy(this.evaluateExpression(statement.condition, environment))) {
      return this.executeBlock(statement.thenBranch, new Environment(environment));
    }
    if (statement.elseBranch) {
      return this.executeBlock(statement.elseBranch, new Environment(environment));
    }
    return null;
  }

  private executeFor(statement: ForStatement, environment: Environment): RuntimeValue | ControlSignal {
    const iterable = this.evaluateExpression(statement.iterable, environment);
    if (!Array.isArray(iterable)) {
      throw new RuntimeError("for loop expects range(...) to evaluate to a list");
    }

    let lastValue: RuntimeValue = null;
    for (const item of iterable) {
      const loopEnv = new Environment(environment);
      loopEnv.define(statement.iterator.name, item);
      const result = this.executeBlock(statement.body, loopEnv);
      if (isControlSignal(result)) {
        return result;
      }
      lastValue = result;
    }
    return lastValue;
  }

  private executeWhile(statement: WhileStatement, environment: Environment): RuntimeValue | ControlSignal {
    let steps = 0;
    let lastValue: RuntimeValue = null;

    while (isTruthy(this.evaluateExpression(statement.condition, environment))) {
      steps += 1;
      if (steps > this.hooks.maxWhileSteps) {
        throw new RuntimeError("while loop exceeded max steps");
      }
      const result = this.executeBlock(statement.body, new Environment(environment));
      if (isControlSignal(result)) {
        return result;
      }
      lastValue = result;
    }

    return lastValue;
  }

  private executeFunctionDefinition(statement: FunctionDefinition, environment: Environment): RuntimeValue {
    const fn: UserFunctionValue = {
      kind: "user-function",
      name: statement.name.name,
      parameters: statement.parameters.map((param) => param.name),
      body: statement.body,
      closure: environment,
    };
    environment.define(statement.name.name, fn);
    return fn;
  }

  private executeBlock(body: Statement[], environment: Environment): RuntimeValue | ControlSignal {
    let lastValue: RuntimeValue = null;
    for (const statement of body) {
      const result = this.execute(statement, environment);
      if (isControlSignal(result)) {
        return result;
      }
      lastValue = result;
    }
    return lastValue;
  }

  private evaluateExpression(expression: Expression, environment: Environment): RuntimeValue {
    switch (expression.type) {
      case "Identifier":
        return environment.get(expression.name);
      case "NumericLiteral":
        return expression.value;
      case "StringLiteral":
        return expression.value;
      case "BooleanLiteral":
        return expression.value;
      case "ListLiteral":
        return expression.elements.map((element) => this.evaluateExpression(element, environment));
      case "UnaryExpression":
        return this.evaluateUnary(expression, environment);
      case "BinaryExpression":
        return this.evaluateBinary(expression, environment);
      case "CallExpression":
        return this.evaluateCall(expression, environment);
      case "IndexExpression":
        return this.evaluateIndex(expression, environment);
      case "MemberExpression":
        return this.evaluateMember(expression, environment);
    }
  }

  private evaluateUnary(expression: UnaryExpression, environment: Environment): RuntimeValue {
    const value = this.evaluateExpression(expression.argument, environment);
    if (expression.operator === "-") {
      assertNumber(value, "unary '-' operand");
      return -value;
    }
    return !isTruthy(value);
  }

  private evaluateBinary(expression: BinaryExpression, environment: Environment): RuntimeValue {
    const left = this.evaluateExpression(expression.left, environment);
    const right = this.evaluateExpression(expression.right, environment);

    switch (expression.operator) {
      case "+":
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" || typeof right === "string") {
          return stringifyRuntimeValue(left) + stringifyRuntimeValue(right);
        }
        throw new RuntimeError("operator '+' expects numbers or strings");
      case "-":
        assertNumber(left, "left side of '-'");
        assertNumber(right, "right side of '-'");
        return left - right;
      case "*":
        assertNumber(left, "left side of '*'");
        assertNumber(right, "right side of '*'");
        return left * right;
      case "/":
        assertNumber(left, "left side of '/'");
        assertNumber(right, "right side of '/'");
        return left / right;
      case "%":
        assertNumber(left, "left side of '%'");
        assertNumber(right, "right side of '%'");
        return left % right;
      case "==":
        return compareValues(left, right);
      case "!=":
        return !compareValues(left, right);
      case "<":
        assertNumber(left, "left side of '<'");
        assertNumber(right, "right side of '<'");
        return left < right;
      case "<=":
        assertNumber(left, "left side of '<='");
        assertNumber(right, "right side of '<='");
        return left <= right;
      case ">":
        assertNumber(left, "left side of '>'");
        assertNumber(right, "right side of '>'");
        return left > right;
      case ">=":
        assertNumber(left, "left side of '>='");
        assertNumber(right, "right side of '>='");
        return left >= right;
    }
  }

  private evaluateCall(expression: CallExpression, environment: Environment): RuntimeValue {
    const callee = this.evaluateExpression(expression.callee, environment);
    const args = expression.arguments.map((arg) => this.evaluateExpression(arg, environment));

    if (!isCallable(callee)) {
      throw new RuntimeError("Attempted to call a non-callable value");
    }

    if (callee.kind === "builtin") {
      return callee.call(args);
    }

    const fnEnv = new Environment(callee.closure as Environment);
    for (let index = 0; index < callee.parameters.length; index += 1) {
      fnEnv.define(callee.parameters[index], args[index] ?? null);
    }
    const result = this.executeBlock(callee.body, fnEnv);
    return isControlSignal(result) ? result.value : null;
  }

  private evaluateIndex(expression: IndexExpression, environment: Environment): RuntimeValue {
    const target = this.evaluateExpression(expression.target, environment);
    const index = this.evaluateExpression(expression.index, environment);

    if (!Array.isArray(target)) {
      throw new RuntimeError("Index access requires a list");
    }
    assertNumber(index, "list index");
    if (!Number.isInteger(index) || index < 0 || index >= target.length) {
      throw new RuntimeError("List index out of range");
    }
    return target[index];
  }

  private evaluateMember(expression: MemberExpression, environment: Environment): RuntimeValue {
    const object = this.evaluateExpression(expression.object, environment);
    if (!isRuntimeObject(object)) {
      throw new RuntimeError(`Cannot access property '${expression.property.name}'`);
    }
    const value = object[expression.property.name];
    if (value === undefined) {
      throw new RuntimeError(`Unknown property '${expression.property.name}'`);
    }
    return value;
  }

  private createBuiltin(name: string, call: BuiltinCallable["call"]): BuiltinCallable {
    return { kind: "builtin", name, call };
  }

  private createModule(entries: Record<string, RuntimeValue>): RuntimeObject {
    return { ...entries };
  }
}

function assertNumber(value: RuntimeValue, label: string): asserts value is number {
  if (typeof value !== "number") {
    throw new RuntimeError(`${label} must be a number`);
  }
}

function compareValues(left: RuntimeValue, right: RuntimeValue): boolean {
  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length &&
      left.every((value, index) => compareValues(value, right[index] ?? null))
    );
  }
  return left === right;
}

function isTruthy(value: RuntimeValue): boolean {
  if (value === null) {
    return false;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === "object") {
    return true;
  }
  return Boolean(value);
}

function isControlSignal(value: RuntimeValue | ControlSignal): value is ControlSignal {
  return typeof value === "object" && value !== null && "type" in value && value.type === "return";
}
