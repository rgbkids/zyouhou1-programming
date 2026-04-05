import { describe, it, expect, beforeEach } from "vitest";
import { runCode } from "../src/runtime/evaluator";
import { setRandomSeed } from "../src/runtime/builtins";

async function lines(src: string) {
  const r = await runCode(src);
  return r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
}

describe("lists", () => {
  it("creates and indexes a list", async () => {
    const out = await lines("a = [10, 20, 30]\nprint(a[0])\nprint(a[2])\n");
    expect(out).toEqual(["10", "30"]);
  });

  it("assigns to list index", async () => {
    const out = await lines("a = [1, 2, 3]\na[1] = 99\nprint(a)\n");
    expect(out).toEqual(["[1, 99, 3]"]);
  });

  it("len() returns list length", async () => {
    const out = await lines("a = [5, 6, 7, 8]\nprint(len(a))\n");
    expect(out).toEqual(["4"]);
  });

  it("out-of-range index raises error", async () => {
    const r = await runCode("a = [1, 2]\nprint(a[5])\n");
    expect(r.error).toMatch(/範囲外/);
  });

  it("negative index works", async () => {
    const out = await lines("a = [10, 20, 30]\nprint(a[-1])\n");
    expect(out).toEqual(["30"]);
  });

  it("computes list sum with for loop", async () => {
    const src = `a = [1, 2, 3, 4, 5]
total = 0
for i in range(0, len(a), 1):
    total = total + a[i]
print(total)
`;
    const out = await lines(src);
    expect(out).toEqual(["15"]);
  });
});

describe("random", () => {
  beforeEach(() => setRandomSeed(42));

  it("randrange(n) returns value in [0, n)", async () => {
    const src = `for i in range(0, 20, 1):
    x = random.randrange(6)
    if x < 0 or x >= 6:
        print("NG")
print("OK")
`;
    const out = await lines(src);
    expect(out).toEqual(["OK"]);
  });

  it("randrange(start, stop) returns value in [start, stop)", async () => {
    const src = `for i in range(0, 20, 1):
    x = random.randrange(1, 7)
    if x < 1 or x > 6:
        print("NG")
print("OK")
`;
    const out = await lines(src);
    expect(out).toEqual(["OK"]);
  });

  it("seed produces deterministic output", async () => {
    setRandomSeed(123);
    const r1 = await lines("print(random.randrange(100))\n");
    setRandomSeed(123);
    const r2 = await lines("print(random.randrange(100))\n");
    expect(r1).toEqual(r2);
  });
});

describe("functions", () => {
  it("defines and calls a function", async () => {
    const src = `def greet(name):
    print("Hello", name)

greet("world")
`;
    const out = await lines(src);
    expect(out).toEqual(["Hello world"]);
  });

  it("returns a value", async () => {
    const src = `def add(a, b):
    return a + b

result = add(3, 4)
print(result)
`;
    const out = await lines(src);
    expect(out).toEqual(["7"]);
  });

  it("has local scope (does not leak)", async () => {
    const src = `def f():
    local_var = 99

f()
print(local_var)
`;
    const r = await runCode(src);
    expect(r.error).toMatch(/local_var/);
  });

  it("recursive function works", async () => {
    const src = `def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(5))
`;
    const out = await lines(src);
    expect(out).toEqual(["120"]);
  });

  it("function with list argument", async () => {
    const src = `def list_sum(lst):
    total = 0
    for i in range(0, len(lst), 1):
        total = total + lst[i]
    return total

print(list_sum([1, 2, 3, 4, 5]))
`;
    const out = await lines(src);
    expect(out).toEqual(["15"]);
  });
});
