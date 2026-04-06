import { describe, expect, it } from "vitest";

import { Evaluator } from "../src/runtime/evaluator";

describe("control flow", () => {
  it("runs the basic control flow sample", () => {
    const evaluator = new Evaluator();
    const result = evaluator.run([
      "total = 0",
      "for i in range(1, 6, 1):",
      "    total = total + i",
      "if total >= 15:",
      "    print(\"pass\")",
      "else:",
      "    print(\"fail\")",
      "print(total)",
    ].join("\n"));

    expect(result.outputs).toEqual(["pass", "15"]);
  });
});
