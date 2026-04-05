// Golden tests for sample programs
// Each test runs a full sample and verifies the expected output pattern.

import { describe, it, expect, beforeEach } from "vitest";
import { runCode } from "../src/runtime/evaluator";
import { setRandomSeed } from "../src/runtime/builtins";

async function stdout(src: string, opts = {}) {
  const r = await runCode(src, opts);
  return r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
}

describe("sample: sequential", () => {
  it("prints greeting lines in order", async () => {
    const out = await stdout('print("おはよう")\nprint("こんにちは")\nprint("おやすみ")\n');
    expect(out).toEqual(["おはよう", "こんにちは", "おやすみ"]);
  });
});

describe("sample: branch", () => {
  it("score 75 → 合格", async () => {
    const src = `score = 75
if score >= 60:
    print("合格")
else:
    print("不合格")
`;
    expect(await stdout(src)).toEqual(["合格"]);
  });
});

describe("sample: for loop sum", () => {
  it("sums 1 to 5 = 15", async () => {
    const src = `total = 0
for i in range(1, 6, 1):
    total = total + i
print(total)
`;
    expect(await stdout(src)).toEqual(["15"]);
  });
});

describe("sample: linear search", () => {
  it("finds element and reports index", async () => {
    const src = `data = [5, 3, 8, 1, 9]
target = 8
for i in range(0, len(data), 1):
    if data[i] == target:
        print("found at", i)
`;
    expect(await stdout(src)).toContain("found at 2");
  });
});

describe("sample: selection sort", () => {
  it("sorts array correctly", async () => {
    const src = `def selection_sort(lst):
    n = len(lst)
    for i in range(0, n - 1, 1):
        min_idx = i
        for j in range(i + 1, n, 1):
            if lst[j] < lst[min_idx]:
                min_idx = j
        if min_idx != i:
            tmp = lst[i]
            lst[i] = lst[min_idx]
            lst[min_idx] = tmp
    return lst

data = [5, 3, 8, 1, 9, 2]
result = selection_sort(data)
print(result)
`;
    expect(await stdout(src)).toEqual(["[1, 2, 3, 5, 8, 9]"]);
  });
});

describe("sample: floating-point error", () => {
  it("demonstrates 0.28 - 0.27 error", async () => {
    const src = `result = 0.28 - 0.27
print(result)
`;
    const out = await stdout(src);
    // Result should NOT be exactly "0.01" due to float error
    expect(out[0]).not.toBe("0.01");
  });

  it("integer workaround gives exact result", async () => {
    const src = `result = (28 - 27) / 100
print(result)
`;
    expect(await stdout(src)).toEqual(["0.01"]);
  });
});

describe("sample: function", () => {
  it("recursive factorial", async () => {
    const src = `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(5))
print(fact(10))
`;
    const out = await stdout(src);
    expect(out[0]).toBe("120");
    expect(out[1]).toBe("3628800");
  });
});

describe("sample: random (seeded)", () => {
  beforeEach(() => setRandomSeed(42));

  it("dice simulation produces 6 count groups", async () => {
    const src = `counts = [0, 0, 0, 0, 0, 0]
for i in range(0, 60, 1):
    d = random.randrange(1, 7)
    counts[d - 1] = counts[d - 1] + 1
total = 0
for i in range(0, 6, 1):
    total = total + counts[i]
print(total)
`;
    const out = await stdout(src);
    expect(out).toEqual(["60"]);
  });
});

describe("sample: device", () => {
  it("reads accelerometer and sets LED", async () => {
    const deviceCtx = {
      getState: () => ({
        accelerometer: { x: 600, y: 0, z: -1024 },
        temperature: 25,
        lightLevel: 128,
        ledText: "",
        ledClear: true,
        motorSpeed: 0,
      }),
      setState: (u: (s: typeof import("../src/runtime/device").DEFAULT_DEVICE_STATE) => typeof import("../src/runtime/device").DEFAULT_DEVICE_STATE) => u,
    };
    const src = `x = device.accelerometer_x()
if x > 500:
    print("右")
else:
    print("左")
`;
    const out = await stdout(src, { deviceCtx: deviceCtx as never });
    expect(out).toEqual(["右"]);
  });
});
