import { describe, it, expect } from "vitest";
import { IOBuffer } from "../src/runtime/io";
import { runCode } from "../src/runtime/evaluator";

describe("IOBuffer", () => {
  it("collects stdout lines", () => {
    const buf = new IOBuffer();
    buf.stdout("line 1");
    buf.stdout("line 2");
    const lines = buf.getLines();
    expect(lines).toHaveLength(2);
    expect(lines[0]).toEqual({ kind: "stdout", text: "line 1" });
    expect(lines[1]).toEqual({ kind: "stdout", text: "line 2" });
  });

  it("collects stderr lines separately", () => {
    const buf = new IOBuffer();
    buf.stdout("ok");
    buf.stderr("error!");
    const lines = buf.getLines();
    expect(lines[0].kind).toBe("stdout");
    expect(lines[1].kind).toBe("stderr");
  });

  it("clears the buffer", () => {
    const buf = new IOBuffer();
    buf.stdout("hello");
    buf.clear();
    expect(buf.getLines()).toHaveLength(0);
  });

  it("fires listener on each line", () => {
    const buf = new IOBuffer();
    const received: string[] = [];
    buf.onLine((l) => received.push(l.text));
    buf.stdout("a");
    buf.stdout("b");
    expect(received).toEqual(["a", "b"]);
  });

  it("unsubscribes listener", () => {
    const buf = new IOBuffer();
    const received: string[] = [];
    const unsub = buf.onLine((l) => received.push(l.text));
    buf.stdout("a");
    unsub();
    buf.stdout("b");
    expect(received).toEqual(["a"]);
  });
});

describe("print output", () => {
  async function lines(src: string) {
    const r = await runCode(src);
    return r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
  }

  it("prints multiple values with space separator", async () => {
    const out = await lines('print("hello", "world")\n');
    expect(out).toEqual(["hello world"]);
  });

  it("prints numbers", async () => {
    const out = await lines("print(1, 2, 3)\n");
    expect(out).toEqual(["1 2 3"]);
  });

  it("print of list shows bracket form", async () => {
    const out = await lines("print([1, 2, 3])\n");
    expect(out).toEqual(["[1, 2, 3]"]);
  });

  it("multi-line print produces separate lines", async () => {
    const out = await lines("print(1)\nprint(2)\nprint(3)\n");
    expect(out).toEqual(["1", "2", "3"]);
  });

  it("error goes to stderr", async () => {
    const r = await runCode("print(undefined_x)\n");
    const err = r.output.filter((l) => l.kind === "stderr");
    expect(err.length).toBeGreaterThan(0);
  });
});
