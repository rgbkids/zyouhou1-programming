import { describe, expect, it } from "vitest";

import { createRuntimeSession } from "../src/runtime/builtins";

describe("webapi", () => {
  it("returns allowlisted mock responses", () => {
    const session = createRuntimeSession();
    session.evaluator.run([
      "value = webapi.get_json(\"zip\", \"1000001\")",
      "print(value)",
    ].join("\n"));

    expect(session.output.snapshot()[0]?.text).toContain("千代田区");
  });
});
