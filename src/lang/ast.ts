// AST node definitions for info1 language

export interface Pos {
  line: number;
  col: number;
}

// ─── Expression nodes ────────────────────────────────────────────────────────

export type BinOp =
  | "+" | "-" | "*" | "/" | "//" | "%" | "**"
  | "==" | "!=" | "<" | "<=" | ">" | ">="
  | "and" | "or";

export type Expr =
  | { kind: "number";  value: number;  pos: Pos }
  | { kind: "string";  value: string;  pos: Pos }
  | { kind: "bool";    value: boolean; pos: Pos }
  | { kind: "none";                    pos: Pos }
  | { kind: "name";    name: string;   pos: Pos }
  | { kind: "binop";   op: BinOp; left: Expr; right: Expr; pos: Pos }
  | { kind: "unop";    op: "neg" | "not"; operand: Expr; pos: Pos }
  | { kind: "list";    items: Expr[];  pos: Pos }
  | { kind: "index";   obj: Expr; idx: Expr; pos: Pos }
  | { kind: "call";    func: Expr; args: Expr[]; pos: Pos }
  | { kind: "attr";    obj: Expr; attr: string;  pos: Pos }
  ;

// ─── Statement nodes ─────────────────────────────────────────────────────────

export type Stmt =
  | { kind: "assign";       target: string; value: Expr;                                     pos: Pos }
  | { kind: "index_assign"; obj: Expr; idx: Expr; value: Expr;                               pos: Pos }
  | { kind: "expr_stmt";    expr: Expr;                                                       pos: Pos }
  | { kind: "if";           cond: Expr; then: Stmt[]; elifs: ElifClause[]; else_: Stmt[];    pos: Pos }
  | { kind: "for";          var_: string; iter: Expr; body: Stmt[];                          pos: Pos }
  | { kind: "while";        cond: Expr; body: Stmt[];                                        pos: Pos }
  | { kind: "return";       value: Expr | null;                                              pos: Pos }
  | { kind: "break";                                                                          pos: Pos }
  | { kind: "continue";                                                                       pos: Pos }
  | { kind: "pass";                                                                           pos: Pos }
  | { kind: "def";          name: string; params: string[]; body: Stmt[];                    pos: Pos }
  ;

export interface ElifClause {
  cond: Expr;
  body: Stmt[];
}

// ─── Program ─────────────────────────────────────────────────────────────────

export interface Program {
  stmts: Stmt[];
}
