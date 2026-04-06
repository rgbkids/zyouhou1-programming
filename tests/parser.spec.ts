import { describe, expect, it } from "vitest";

import { parse, ParseError } from "../src/lang/parser";
import { tokenize } from "../src/lang/tokenizer";

describe("tokenize", () => {
  it("produces indent and dedent tokens for blocks", () => {
    const tokens = tokenize([
      "if true:",
      "    print(\"ok\")",
      "print(\"done\")",
    ].join("\n"));

    expect(tokens.map((token) => token.type)).toContain("INDENT");
    expect(tokens.map((token) => token.type)).toContain("DEDENT");
  });
});

describe("parse", () => {
  it("parses assignment and print", () => {
    const program = parse([
      "x = 10",
      "print(x)",
    ].join("\n"));

    expect(program.body).toHaveLength(2);
    expect(program.body[0]).toMatchObject({
      type: "AssignmentStatement",
      target: { name: "x" },
    });
    expect(program.body[1]).toMatchObject({
      type: "PrintStatement",
    });
  });

  it("parses if/else blocks", () => {
    const program = parse([
      "if score >= 60:",
      "    print(\"pass\")",
      "else:",
      "    print(\"fail\")",
    ].join("\n"));

    expect(program.body[0]).toMatchObject({
      type: "IfStatement",
      elseBranch: [{ type: "PrintStatement" }],
    });
  });

  it("parses for-range, while, list, and functions", () => {
    const program = parse([
      "nums = [1, 2, 3]",
      "for i in range(0, 3, 1):",
      "    print(nums[i])",
      "while true:",
      "    print(\"loop\")",
      "def add(a, b):",
      "    return a + b",
      "print(add(1, 2))",
    ].join("\n"));

    expect(program.body[1]).toMatchObject({ type: "ForStatement" });
    expect(program.body[2]).toMatchObject({ type: "WhileStatement" });
    expect(program.body[3]).toMatchObject({
      type: "FunctionDefinition",
      name: { name: "add" },
    });
  });

  it("parses member and call expressions for built-ins", () => {
    const program = parse([
      "result = webapi.get_json(\"zip\", \"1000001\")",
      "device.led_show(\"OK\")",
      "n = random.randrange(6)",
    ].join("\n"));

    expect(program.body[0]).toMatchObject({
      type: "AssignmentStatement",
      value: {
        type: "CallExpression",
      },
    });
    expect(program.body[1]).toMatchObject({
      type: "ExpressionStatement",
      expression: { type: "CallExpression" },
    });
  });

  it("reports syntax errors with line and column", () => {
    expect(() => parse("if true\n    print(\"x\")")).toThrow(ParseError);

    try {
      parse("if true\n    print(\"x\")");
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);
      expect((error as ParseError).line).toBe(1);
      expect((error as ParseError).column).toBeGreaterThan(1);
    }
  });
});
