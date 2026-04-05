import { describe, expect, it } from "vitest";

import { OutputBuffer } from "../src/runtime/io";

describe("OutputBuffer", () => {
  it("stores stdout and stderr lines separately", () => {
    const buffer = new OutputBuffer();
    buffer.write("stdout", "ok");
    buffer.write("stderr", "ng");

    expect(buffer.snapshot()).toEqual([
      { channel: "stdout", text: "ok" },
      { channel: "stderr", text: "ng" },
    ]);
  });
});
