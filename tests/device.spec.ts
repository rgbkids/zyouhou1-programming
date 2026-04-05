import { describe, expect, it } from "vitest";

import { createRuntimeSession } from "../src/runtime/builtins";

describe("device", () => {
  it("reads and writes mock device state", () => {
    const session = createRuntimeSession();
    session.deviceState.temperature = 29;

    session.evaluator.run([
      "print(device.temperature())",
      "device.led_show(\"HOT\")",
    ].join("\n"));

    expect(session.output.snapshot().map((line) => line.text)).toEqual(["29"]);
    expect(session.deviceState.ledText).toBe("HOT");
  });
});
