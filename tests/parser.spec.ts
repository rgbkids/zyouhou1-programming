import { describe, it, expect } from "vitest";
import { parse } from "../src/lang/parser";
import { tokenize } from "../src/lang/tokenizer";

describe("tokenizer", () => {
  it("tokenizes a simple assignment", () => {
    const tokens = tokenize("x = 1\n");
    expect(tokens.map((t) => t.kind)).toEqual(["NAME", "ASSIGN", "NUMBER", "NEWLINE", "EOF"]);
  });

  it("tokenizes keywords", () => {
    const tokens = tokenize("if True:\n    pass\n");
    const kinds = tokens.map((t) => t.kind);
    expect(kinds).toContain("NAME");   // "if" as NAME (value="if")
    expect(kinds).toContain("COLON");
    expect(kinds).toContain("INDENT");
    expect(kinds).toContain("DEDENT");
  });

  it("tokenizes a float number", () => {
    const tokens = tokenize("x = 3.14\n");
    const num = tokens.find((t) => t.kind === "NUMBER");
    expect(num?.value).toBe("3.14");
  });

  it("tokenizes double-quoted string", () => {
    const tokens = tokenize('s = "hello"\n');
    const str = tokens.find((t) => t.kind === "STRING");
    expect(str?.value).toBe("hello");
  });

  it("tokenizes single-quoted string", () => {
    const tokens = tokenize("s = 'world'\n");
    const str = tokens.find((t) => t.kind === "STRING");
    expect(str?.value).toBe("world");
  });

  it("skips blank lines and comments", () => {
    const tokens = tokenize("# comment\n\nx = 1\n");
    const names = tokens.filter((t) => t.kind === "NAME");
    expect(names.map((t) => t.value)).toEqual(["x"]);
  });

  it("handles INDENT and DEDENT", () => {
    const src = "if True:\n    x = 1\nx = 2\n";
    const tokens = tokenize(src);
    const kinds = tokens.map((t) => t.kind);
    expect(kinds).toContain("INDENT");
    expect(kinds).toContain("DEDENT");
  });
});

describe("parser – assignments and expressions", () => {
  it("parses simple assignment", () => {
    const prog = parse("x = 1\n");
    expect(prog.stmts).toHaveLength(1);
    expect(prog.stmts[0].kind).toBe("assign");
  });

  it("parses string assignment", () => {
    const prog = parse('name = "太郎"\n');
    const stmt = prog.stmts[0];
    expect(stmt.kind).toBe("assign");
    if (stmt.kind === "assign") {
      expect(stmt.value.kind).toBe("string");
    }
  });

  it("parses arithmetic expression", () => {
    const prog = parse("x = 1 + 2 * 3\n");
    const stmt = prog.stmts[0];
    expect(stmt.kind).toBe("assign");
    if (stmt.kind === "assign") {
      expect(stmt.value.kind).toBe("binop");
    }
  });

  it("parses list literal", () => {
    const prog = parse("a = [1, 2, 3]\n");
    const stmt = prog.stmts[0];
    if (stmt.kind === "assign") {
      expect(stmt.value.kind).toBe("list");
    }
  });

  it("parses index assignment", () => {
    const prog = parse("a[0] = 99\n");
    expect(prog.stmts[0].kind).toBe("index_assign");
  });
});

describe("parser – control flow", () => {
  it("parses if-else", () => {
    const src = "if x > 0:\n    print(x)\nelse:\n    print(0)\n";
    const prog = parse(src);
    expect(prog.stmts[0].kind).toBe("if");
    const stmt = prog.stmts[0];
    if (stmt.kind === "if") {
      expect(stmt.then).toHaveLength(1);
      expect(stmt.else_).toHaveLength(1);
    }
  });

  it("parses if-elif-else", () => {
    const src = "if x > 0:\n    print(1)\nelif x == 0:\n    print(0)\nelse:\n    print(-1)\n";
    const prog = parse(src);
    const stmt = prog.stmts[0];
    if (stmt.kind === "if") {
      expect(stmt.elifs).toHaveLength(1);
    }
  });

  it("parses for loop", () => {
    const src = "for i in range(5):\n    print(i)\n";
    const prog = parse(src);
    expect(prog.stmts[0].kind).toBe("for");
  });

  it("parses while loop", () => {
    const src = "while x > 0:\n    x = x - 1\n";
    const prog = parse(src);
    expect(prog.stmts[0].kind).toBe("while");
  });
});

describe("parser – functions", () => {
  it("parses def with params", () => {
    const src = "def add(a, b):\n    return a + b\n";
    const prog = parse(src);
    expect(prog.stmts[0].kind).toBe("def");
    const fn = prog.stmts[0];
    if (fn.kind === "def") {
      expect(fn.name).toBe("add");
      expect(fn.params).toEqual(["a", "b"]);
    }
  });

  it("parses function call", () => {
    const src = "result = add(1, 2)\n";
    const prog = parse(src);
    const stmt = prog.stmts[0];
    if (stmt.kind === "assign") {
      expect(stmt.value.kind).toBe("call");
    }
  });

  it("parses attribute access", () => {
    const src = "x = random.randrange(6)\n";
    const prog = parse(src);
    const stmt = prog.stmts[0];
    if (stmt.kind === "assign" && stmt.value.kind === "call") {
      expect(stmt.value.func.kind).toBe("attr");
    }
  });
});
