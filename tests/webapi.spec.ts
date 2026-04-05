import { describe, it, expect } from "vitest";
import { runCode } from "../src/runtime/evaluator";
import { findEndpoint } from "../src/runtime/allowlist";

describe("allowlist", () => {
  it("finds registered endpoint", () => {
    const ep = findEndpoint("zipcode");
    expect(ep).toBeDefined();
    expect(ep?.name).toBe("zipcode");
  });

  it("returns undefined for unknown endpoint", () => {
    const ep = findEndpoint("unknown_api");
    expect(ep).toBeUndefined();
  });
});

describe("webapi.get_json (mock mode)", () => {
  async function run(src: string) {
    return runCode(src, { useMockApi: true });
  }

  it("calls webapi.get_json with mock", async () => {
    // info1 has no dict literal; pass API name only (params default to empty)
    const r = await run('data = webapi.get_json("zipcode")\nprint("ok")\n');
    expect(r.error).toBeNull();
    const out = r.output.filter((l) => l.kind === "stdout").map((l) => l.text);
    expect(out).toContain("ok");
  });

  it("errors on unknown API name", async () => {
    const r = await run('webapi.get_json("nonexistent_api")\n');
    expect(r.error).toMatch(/許可リスト/);
  });
});
