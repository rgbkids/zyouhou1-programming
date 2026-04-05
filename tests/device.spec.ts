import { describe, it, expect } from "vitest";
import { runCode } from "../src/runtime/evaluator";
import { DEFAULT_DEVICE_STATE } from "../src/runtime/device";
import type { DeviceState } from "../src/runtime/device";

function makeDeviceCtx(initial?: Partial<DeviceState>) {
  let state: DeviceState = { ...DEFAULT_DEVICE_STATE, ...initial };
  return {
    getState: () => state,
    setState: (updater: (prev: DeviceState) => DeviceState) => {
      state = updater(state);
    },
    _getState: () => state,
  };
}

describe("device module", () => {
  it("reads accelerometer_x", async () => {
    const ctx = makeDeviceCtx({ accelerometer: { x: 512, y: 0, z: -1024 } });
    const r = await runCode("print(device.accelerometer_x())\n", { deviceCtx: ctx });
    const out = r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
    expect(out).toEqual(["512"]);
  });

  it("reads temperature", async () => {
    const ctx = makeDeviceCtx({ temperature: 30 });
    const r = await runCode("print(device.temperature())\n", { deviceCtx: ctx });
    const out = r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
    expect(out).toEqual(["30"]);
  });

  it("led_show updates device state", async () => {
    const ctx = makeDeviceCtx();
    await runCode('device.led_show("Hello")\n', { deviceCtx: ctx });
    expect(ctx._getState().ledText).toBe("Hello");
    expect(ctx._getState().ledClear).toBe(false);
  });

  it("led_clear clears device state", async () => {
    const ctx = makeDeviceCtx({ ledText: "Hi", ledClear: false });
    await runCode("device.led_clear()\n", { deviceCtx: ctx });
    expect(ctx._getState().ledText).toBe("");
    expect(ctx._getState().ledClear).toBe(true);
  });

  it("conditional LED based on sensor value", async () => {
    const ctx = makeDeviceCtx({ accelerometer: { x: 600, y: 0, z: -1024 } });
    const src = `x = device.accelerometer_x()
if x > 500:
    device.led_show("RIGHT")
else:
    device.led_show("OK")
`;
    await runCode(src, { deviceCtx: ctx });
    expect(ctx._getState().ledText).toBe("RIGHT");
  });
});
