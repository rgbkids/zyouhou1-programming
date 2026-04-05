import { WEBAPI_ALLOWLIST } from "./allowlist";
import { createDeviceHooks, createDeviceState, type DeviceState } from "./device";
import { Evaluator, type RuntimeHooks } from "./evaluator";
import { OutputBuffer } from "./io";
import type { RuntimeValue } from "./value";
import { createWebApiHandlers } from "./webapi";

export type RuntimeSession = {
  evaluator: Evaluator;
  output: OutputBuffer;
  deviceState: DeviceState;
};

export function createRuntimeSession(options?: {
  randomRange?: RuntimeHooks["randomRange"];
  trace?: (line: string) => void;
}): RuntimeSession {
  const output = new OutputBuffer();
  const deviceState = createDeviceState();
  const webapiHandlers = createWebApiHandlers();

  const evaluator = new Evaluator({
    maxWhileSteps: 1_000,
    randomRange: options?.randomRange,
    print: (...values) => {
      output.write("stdout", values.map(stringify).join(" "));
    },
    webapiGetJson: (name, params) => {
      if (!WEBAPI_ALLOWLIST.includes(name as (typeof WEBAPI_ALLOWLIST)[number])) {
        throw new Error(`webapi '${name}' is not allowed`);
      }
      return webapiHandlers[name]?.(params) ?? { error: "not_implemented", name };
    },
    device: createDeviceHooks(deviceState),
  });

  return { evaluator, output, deviceState };
}

function stringify(value: RuntimeValue): string {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value);
}
