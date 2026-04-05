import { describe, it, expect } from "vitest";
import { runCode } from "../src/runtime/evaluator";

async function run(src: string) {
  return runCode(src);
}

function stdoutLines(result: Awaited<ReturnType<typeof run>>) {
  return result.output.filter((l) => l.kind === "stdout").map((l) => l.text);
}

describe("evaluator – expressions", () => {
  it("evaluates number literal", async () => {
    const r = await run("print(42)\n");
    expect(stdoutLines(r)).toEqual(["42"]);
  });

  it("evaluates string literal", async () => {
    const r = await run('print("hello")\n');
    expect(stdoutLines(r)).toEqual(["hello"]);
  });

  it("evaluates True / False / None", async () => {
    const r = await run("print(True)\nprint(False)\nprint(None)\n");
    expect(stdoutLines(r)).toEqual(["True", "False", "None"]);
  });

  it("evaluates arithmetic", async () => {
    const r = await run("print(1 + 2)\nprint(10 - 3)\nprint(4 * 5)\nprint(10 // 3)\nprint(10 % 3)\nprint(2 ** 8)\n");
    expect(stdoutLines(r)).toEqual(["3", "7", "20", "3", "1", "256"]);
  });

  it("evaluates float division", async () => {
    const r = await run("print(7 / 2)\n");
    expect(stdoutLines(r)).toEqual(["3.5"]);
  });

  it("evaluates comparison", async () => {
    const r = await run("print(1 < 2)\nprint(2 == 2)\nprint(3 != 3)\n");
    expect(stdoutLines(r)).toEqual(["True", "True", "False"]);
  });

  it("evaluates logical operators", async () => {
    const r = await run("print(True and False)\nprint(True or False)\nprint(not True)\n");
    expect(stdoutLines(r)).toEqual(["False", "True", "False"]);
  });

  it("evaluates unary minus", async () => {
    const r = await run("print(-5)\n");
    expect(stdoutLines(r)).toEqual(["-5"]);
  });
});

describe("evaluator – variables and assignment", () => {
  it("assigns and reads a variable", async () => {
    const r = await run("x = 10\nprint(x)\n");
    expect(stdoutLines(r)).toEqual(["10"]);
  });

  it("reassigns a variable", async () => {
    const r = await run("x = 1\nx = x + 1\nprint(x)\n");
    expect(stdoutLines(r)).toEqual(["2"]);
  });

  it("reports undefined variable error", async () => {
    const r = await run("print(undefined_var)\n");
    expect(r.error).toMatch(/undefined_var/);
  });
});

describe("evaluator – built-ins", () => {
  it("len on list", async () => {
    const r = await run("print(len([1, 2, 3]))\n");
    expect(stdoutLines(r)).toEqual(["3"]);
  });

  it("len on string", async () => {
    const r = await run('print(len("hello"))\n');
    expect(stdoutLines(r)).toEqual(["5"]);
  });

  it("range(stop)", async () => {
    const r = await run("print(range(3))\n");
    expect(stdoutLines(r)).toEqual(["[0, 1, 2]"]);
  });

  it("range(start, stop)", async () => {
    const r = await run("print(range(1, 4))\n");
    expect(stdoutLines(r)).toEqual(["[1, 2, 3]"]);
  });

  it("int() and float()", async () => {
    const r = await run("print(int(3.7))\nprint(float(3))\n");
    expect(stdoutLines(r)).toEqual(["3", "3"]);
  });

  it("str()", async () => {
    const r = await run("print(str(42))\n");
    expect(stdoutLines(r)).toEqual(["42"]);
  });

  it("abs()", async () => {
    const r = await run("print(abs(-5))\nprint(abs(3))\n");
    expect(stdoutLines(r)).toEqual(["5", "3"]);
  });
});
