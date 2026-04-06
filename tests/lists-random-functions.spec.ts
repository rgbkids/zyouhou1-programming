import { describe, expect, it } from "vitest";

import { Evaluator } from "../src/runtime/evaluator";

describe("lists, random, functions", () => {
  it("supports list indexing and function return values", () => {
    const evaluator = new Evaluator({ randomRange: () => 2 });
    const result = evaluator.run([
      "items = [2, 4, 6]",
      "def first_plus_last(values):",
      "    return values[0] + values[2]",
      "print(first_plus_last(items))",
      "print(random.randrange(6))",
    ].join("\n"));

    expect(result.outputs).toEqual(["8", "2"]);
  });
});
