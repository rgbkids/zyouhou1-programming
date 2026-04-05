// Built-in functions and modules for info1 runtime

import type { Value } from "./value";
import { numVal, strVal, boolVal, listVal, NONE, valueToString } from "./value";
import { RuntimeError } from "./environment";
import type { Environment } from "./environment";
import type { DeviceContext } from "./device";
import { makeDeviceModule } from "./device";
import { callWebApi } from "./webapi";

// ─── Type assertion helpers ───────────────────────────────────────────────────

function assertNumber(v: Value, name: string, line?: number): number {
  if (v.kind !== "number") throw new RuntimeError(`${name} には数値が必要です（${v.kind} が来ました）`, line);
  return v.value;
}

function assertString(v: Value, name: string, line?: number): string {
  if (v.kind !== "string") throw new RuntimeError(`${name} には文字列が必要です（${v.kind} が来ました）`, line);
  return v.value;
}

function assertList(v: Value, name: string, line?: number): Value[] {
  if (v.kind !== "list") throw new RuntimeError(`${name} にはリストが必要です（${v.kind} が来ました）`, line);
  return v.items;
}

// ─── random module ────────────────────────────────────────────────────────────

let _randomSeed: number | null = null;

function seededRandom(): number {
  if (_randomSeed === null) return Math.random();
  // Simple LCG for deterministic tests
  _randomSeed = (_randomSeed * 1664525 + 1013904223) & 0xffffffff;
  return (_randomSeed >>> 0) / 0x100000000;
}

export function setRandomSeed(seed: number | null): void {
  _randomSeed = seed;
}

// ─── Core built-ins (print, len, range, int, float, str, abs, input) ─────────

export function makeBuiltins(
  stdout: (text: string) => void,
  inputMock: () => string,
  deviceCtx?: DeviceContext,
  useMockApi = false,
): Record<string, Value> {
  const builtins: Record<string, Value> = {

    print: {
      kind: "builtin",
      name: "print",
      fn: (args: Value[]) => {
        stdout(args.map(valueToString).join(" "));
        return NONE;
      },
    },

    len: {
      kind: "builtin",
      name: "len",
      fn: (args: Value[]) => {
        if (args.length !== 1) throw new RuntimeError("len() は引数1つが必要です");
        const v = args[0];
        if (v.kind === "list")   return numVal(v.items.length);
        if (v.kind === "string") return numVal(v.value.length);
        throw new RuntimeError(`len() はリストまたは文字列にのみ使えます（${v.kind} が来ました）`);
      },
    },

    range: {
      kind: "builtin",
      name: "range",
      fn: (args: Value[]) => {
        if (args.length < 1 || args.length > 3) {
          throw new RuntimeError("range() の引数は1〜3個です");
        }
        let start = 0, stop = 0, step = 1;
        if (args.length === 1) {
          stop = assertNumber(args[0], "range の引数");
        } else if (args.length === 2) {
          start = assertNumber(args[0], "range の第1引数");
          stop  = assertNumber(args[1], "range の第2引数");
        } else {
          start = assertNumber(args[0], "range の第1引数");
          stop  = assertNumber(args[1], "range の第2引数");
          step  = assertNumber(args[2], "range の第3引数");
        }
        if (step === 0) throw new RuntimeError("range() の step は 0 にできません");
        const items: Value[] = [];
        if (step > 0) {
          for (let i = start; i < stop; i += step) items.push(numVal(i));
        } else {
          for (let i = start; i > stop; i += step) items.push(numVal(i));
        }
        return listVal(items);
      },
    },

    int: {
      kind: "builtin",
      name: "int",
      fn: (args: Value[]) => {
        if (args.length !== 1) throw new RuntimeError("int() は引数1つが必要です");
        const v = args[0];
        if (v.kind === "number") return numVal(Math.trunc(v.value));
        if (v.kind === "string") {
          const n = parseInt(v.value, 10);
          if (isNaN(n)) throw new RuntimeError(`"${v.value}" を整数に変換できません`);
          return numVal(n);
        }
        if (v.kind === "bool") return numVal(v.value ? 1 : 0);
        throw new RuntimeError(`int() は数値・文字列・真偽値にのみ使えます`);
      },
    },

    float: {
      kind: "builtin",
      name: "float",
      fn: (args: Value[]) => {
        if (args.length !== 1) throw new RuntimeError("float() は引数1つが必要です");
        const v = args[0];
        if (v.kind === "number") return v;
        if (v.kind === "string") {
          const n = parseFloat(v.value);
          if (isNaN(n)) throw new RuntimeError(`"${v.value}" を浮動小数点に変換できません`);
          return numVal(n);
        }
        if (v.kind === "bool") return numVal(v.value ? 1.0 : 0.0);
        throw new RuntimeError(`float() は数値・文字列・真偽値にのみ使えます`);
      },
    },

    str: {
      kind: "builtin",
      name: "str",
      fn: (args: Value[]) => {
        if (args.length !== 1) throw new RuntimeError("str() は引数1つが必要です");
        return strVal(valueToString(args[0]));
      },
    },

    abs: {
      kind: "builtin",
      name: "abs",
      fn: (args: Value[]) => {
        if (args.length !== 1) throw new RuntimeError("abs() は引数1つが必要です");
        const n = assertNumber(args[0], "abs の引数");
        return numVal(Math.abs(n));
      },
    },

    input: {
      kind: "builtin",
      name: "input",
      fn: (_args: Value[]) => {
        return strVal(inputMock());
      },
    },

    // random module
    random: {
      kind: "module",
      name: "random",
      attrs: {
        randrange: {
          kind: "builtin",
          name: "random.randrange",
          fn: (args: Value[]) => {
            let start = 0, stop = 0, step = 1;
            if (args.length === 1) {
              stop = assertNumber(args[0], "randrange の引数");
            } else if (args.length === 2) {
              start = assertNumber(args[0], "randrange の第1引数");
              stop  = assertNumber(args[1], "randrange の第2引数");
            } else if (args.length === 3) {
              start = assertNumber(args[0], "randrange の第1引数");
              stop  = assertNumber(args[1], "randrange の第2引数");
              step  = assertNumber(args[2], "randrange の第3引数");
            } else {
              throw new RuntimeError("randrange() の引数は1〜3個です");
            }
            if (step === 0) throw new RuntimeError("randrange() の step は 0 にできません");
            const choices: number[] = [];
            if (step > 0) {
              for (let i = start; i < stop; i += step) choices.push(i);
            } else {
              for (let i = start; i > stop; i += step) choices.push(i);
            }
            if (choices.length === 0) throw new RuntimeError("randrange() の範囲が空です");
            const idx = Math.floor(seededRandom() * choices.length);
            return numVal(choices[idx]);
          },
        } as Value,
        seed: {
          kind: "builtin",
          name: "random.seed",
          fn: (args: Value[]) => {
            if (args.length === 0) {
              setRandomSeed(null);
            } else {
              const s = assertNumber(args[0], "seed の引数");
              setRandomSeed(s);
            }
            return NONE;
          },
        } as Value,
      },
    },

    // webapi module
    webapi: {
      kind: "module",
      name: "webapi",
      attrs: {
        get_json: {
          kind: "builtin",
          name: "webapi.get_json",
          fn: async (args: Value[]) => {
            if (args.length < 1) throw new RuntimeError("webapi.get_json() はAPI名が必要です");
            const name = assertString(args[0], "webapi.get_json の第1引数");
            const params: Record<string, string> = {};
            if (args.length >= 2) {
              const pVal = args[1];
              if (pVal.kind === "module") {
                for (const [k, v] of Object.entries(pVal.attrs)) {
                  params[k] = valueToString(v);
                }
              }
            }
            return await callWebApi(name, params, useMockApi);
          },
        } as Value,
      },
    },
  };

  // device module (optional)
  if (deviceCtx) {
    const dm = makeDeviceModule(deviceCtx);
    builtins.device = {
      kind: "module",
      name: "device",
      attrs: {
        accelerometer_x: { kind: "builtin", name: "device.accelerometer_x", fn: () => numVal(dm.accelerometer_x()) },
        accelerometer_y: { kind: "builtin", name: "device.accelerometer_y", fn: () => numVal(dm.accelerometer_y()) },
        accelerometer_z: { kind: "builtin", name: "device.accelerometer_z", fn: () => numVal(dm.accelerometer_z()) },
        temperature:     { kind: "builtin", name: "device.temperature",     fn: () => numVal(dm.temperature()) },
        light_level:     { kind: "builtin", name: "device.light_level",     fn: () => numVal(dm.light_level()) },
        led_show: {
          kind: "builtin",
          name: "device.led_show",
          fn: (args: Value[]) => {
            const text = args.length > 0 ? valueToString(args[0]) : "";
            dm.led_show(text);
            return NONE;
          },
        },
        led_clear: {
          kind: "builtin",
          name: "device.led_clear",
          fn: () => { dm.led_clear(); return NONE; },
        },
        motor_set: {
          kind: "builtin",
          name: "device.motor_set",
          fn: (args: Value[]) => {
            const speed = args.length > 0 ? assertNumber(args[0], "motor_set の引数") : 0;
            dm.motor_set(speed);
            return NONE;
          },
        },
      } as Record<string, Value>,
    };
  }

  return builtins;
}

export function setupGlobalEnv(env: Environment, builtins: Record<string, Value>): void {
  for (const [name, value] of Object.entries(builtins)) {
    env.define(name, value);
  }
}
