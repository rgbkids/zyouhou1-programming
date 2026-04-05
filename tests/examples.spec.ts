import { describe, expect, it } from "vitest";

import { samples } from "../src/samples";

describe("sample registry", () => {
  it("includes core teaching categories", () => {
    const categories = new Set(samples.map((sample) => sample.category));
    expect(categories.has("basic")).toBe(true);
    expect(categories.has("algorithm")).toBe(true);
    expect(categories.has("simulation")).toBe(true);
  });
});
