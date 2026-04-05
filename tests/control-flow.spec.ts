import { describe, it, expect } from "vitest";
import { runCode } from "../src/runtime/evaluator";

async function lines(src: string) {
  const r = await runCode(src);
  return r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
}

describe("sequential execution", () => {
  it("executes statements top-to-bottom", async () => {
    const out = await lines('print("a")\nprint("b")\nprint("c")\n');
    expect(out).toEqual(["a", "b", "c"]);
  });
});

describe("if / elif / else", () => {
  it("takes then branch when true", async () => {
    const out = await lines("if True:\n    print(1)\n");
    expect(out).toEqual(["1"]);
  });

  it("takes else branch when false", async () => {
    const out = await lines("if False:\n    print(1)\nelse:\n    print(2)\n");
    expect(out).toEqual(["2"]);
  });

  it("handles elif correctly", async () => {
    const src = `x = 0
if x > 0:
    print("pos")
elif x == 0:
    print("zero")
else:
    print("neg")
`;
    const out = await lines(src);
    expect(out).toEqual(["zero"]);
  });

  it("合格/不合格判定", async () => {
    const src = `score = 75
if score >= 60:
    print("合格")
else:
    print("不合格")
`;
    const out = await lines(src);
    expect(out).toEqual(["合格"]);
  });
});

describe("for loop", () => {
  it("iterates range correctly", async () => {
    const out = await lines("for i in range(1, 4, 1):\n    print(i)\n");
    expect(out).toEqual(["1", "2", "3"]);
  });

  it("accumulates sum over range", async () => {
    const src = `total = 0
for i in range(1, 6, 1):
    total = total + i
print(total)
`;
    const out = await lines(src);
    expect(out).toEqual(["15"]);
  });

  it("iterates over a list", async () => {
    const src = `for x in [10, 20, 30]:
    print(x)
`;
    const out = await lines(src);
    expect(out).toEqual(["10", "20", "30"]);
  });

  it("break exits loop early", async () => {
    const src = `for i in range(0, 10, 1):
    if i == 3:
        break
    print(i)
`;
    const out = await lines(src);
    expect(out).toEqual(["0", "1", "2"]);
  });

  it("continue skips to next iteration", async () => {
    const src = `for i in range(0, 5, 1):
    if i == 2:
        continue
    print(i)
`;
    const out = await lines(src);
    expect(out).toEqual(["0", "1", "3", "4"]);
  });
});

describe("while loop", () => {
  it("counts down", async () => {
    const src = `n = 3
while n > 0:
    print(n)
    n = n - 1
`;
    const out = await lines(src);
    expect(out).toEqual(["3", "2", "1"]);
  });

  it("does not execute body when condition is initially false", async () => {
    const out = await lines("while False:\n    print(99)\n");
    expect(out).toEqual([]);
  });

  it("break exits while loop", async () => {
    const src = `x = 0
while True:
    x = x + 1
    if x == 3:
        break
print(x)
`;
    const out = await lines(src);
    expect(out).toEqual(["3"]);
  });

  it("prevents infinite loop with guard", async () => {
    const src = `while True:
    x = 1
`;
    const r = await runCode(src);
    expect(r.error).toMatch(/ループ/);
  });
});
