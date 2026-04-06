import { describe, expect, it } from "vitest";

import { Evaluator, RuntimeError } from "../src/runtime/evaluator";

describe("Evaluator", () => {
  it("evaluates sequential statements and print output", () => {
    const runtime = new Evaluator();
    const result = runtime.run([
      "x = 10",
      "y = 5",
      "print(x + y)",
    ].join("\n"));

    expect(result.outputs).toEqual(["15"]);
    expect(result.environment.get("x")).toBe(10);
    expect(result.environment.get("y")).toBe(5);
  });

  it("evaluates if/else and for-range", () => {
    const runtime = new Evaluator();
    const result = runtime.run([
      "total = 0",
      "for i in range(1, 5, 1):",
      "    total = total + i",
      "if total == 10:",
      "    print(\"ok\")",
      "else:",
      "    print(\"ng\")",
    ].join("\n"));

    expect(result.environment.get("total")).toBe(10);
    expect(result.outputs).toEqual(["ok"]);
  });

  it("evaluates while loops with reassignment", () => {
    const runtime = new Evaluator();
    const result = runtime.run([
      "x = 0",
      "while x < 3:",
      "    x = x + 1",
      "print(x)",
    ].join("\n"));

    expect(result.environment.get("x")).toBe(3);
    expect(result.outputs).toEqual(["3"]);
  });

  it("evaluates lists, indexing, len, and user functions", () => {
    const runtime = new Evaluator();
    const result = runtime.run([
      "nums = [10, 20, 30]",
      "def add_first_two(items):",
      "    return items[0] + items[1]",
      "print(len(nums))",
      "print(add_first_two(nums))",
    ].join("\n"));

    expect(result.outputs).toEqual(["3", "30"]);
  });

  it("uses injected random, webapi, and device hooks", () => {
    const runtime = new Evaluator({
      randomRange: () => 4,
      webapiGetJson: (name, params) => ({ endpoint: name, params }),
      device: {
        temperature: () => 28,
        led_show: (message) => `LED:${String(message)}`,
      },
    });

    const result = runtime.run([
      "print(random.randrange(6))",
      "print(webapi.get_json(\"zip\", \"1000001\"))",
      "print(device.temperature())",
      "print(device.led_show(\"OK\"))",
    ].join("\n"));

    expect(result.outputs).toEqual([
      "4",
      "{\"endpoint\":\"zip\",\"params\":[\"1000001\"]}",
      "28",
      "LED:OK",
    ]);
  });

  it("raises runtime errors for invalid index access", () => {
    const runtime = new Evaluator();

    expect(() =>
      runtime.run([
        "nums = [1, 2]",
        "print(nums[3])",
      ].join("\n")),
    ).toThrow(RuntimeError);
  });

  it("stops runaway while loops with a max step guard", () => {
    const runtime = new Evaluator({ maxWhileSteps: 5 });

    expect(() =>
      runtime.run([
        "while true:",
        "    print(\"x\")",
      ].join("\n")),
    ).toThrow("while loop exceeded max steps");
  });
});
