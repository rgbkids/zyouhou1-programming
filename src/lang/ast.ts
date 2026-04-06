// AST node types for the Info-I interpreter

export interface Position {
  line: number;
  col: number;
}

// ─── Expressions ────────────────────────────────────────────────────────────

export type Expr =
  | NumberLiteral
  | StringLiteral
  | BoolLiteral
  | NoneLiteral
  | ListLiteral
  | Name
  | BinOp
  | UnaryOp
  | Compare
  | BoolOp
  | Call
  | Subscript
  | Attribute;

export interface NumberLiteral {
  kind: 'Number';
  value: number;
  pos: Position;
}

export interface StringLiteral {
  kind: 'String';
  value: string;
  pos: Position;
}

export interface BoolLiteral {
  kind: 'Bool';
  value: boolean;
  pos: Position;
}

export interface NoneLiteral {
  kind: 'None';
  pos: Position;
}

export interface ListLiteral {
  kind: 'List';
  elements: Expr[];
  pos: Position;
}

export interface Name {
  kind: 'Name';
  id: string;
  pos: Position;
}

export type BinOpOp = '+' | '-' | '*' | '/' | '//' | '%' | '**';

export interface BinOp {
  kind: 'BinOp';
  left: Expr;
  op: BinOpOp;
  right: Expr;
  pos: Position;
}

export interface UnaryOp {
  kind: 'UnaryOp';
  op: '-' | 'not';
  operand: Expr;
  pos: Position;
}

export type CmpOp = '==' | '!=' | '<' | '>' | '<=' | '>=';

export interface Compare {
  kind: 'Compare';
  left: Expr;
  ops: CmpOp[];
  comparators: Expr[];
  pos: Position;
}

export interface BoolOp {
  kind: 'BoolOp';
  op: 'and' | 'or';
  values: Expr[];
  pos: Position;
}

export interface Call {
  kind: 'Call';
  func: Expr;
  args: Expr[];
  pos: Position;
}

export interface Subscript {
  kind: 'Subscript';
  value: Expr;
  index: Expr;
  pos: Position;
}

export interface Attribute {
  kind: 'Attribute';
  value: Expr;
  attr: string;
  pos: Position;
}

// ─── Statements ─────────────────────────────────────────────────────────────

export type Stmt =
  | Assign
  | AugAssign
  | ExprStmt
  | If
  | For
  | While
  | FuncDef
  | Return
  | Break
  | Continue;

export interface Assign {
  kind: 'Assign';
  target: AssignTarget;
  value: Expr;
  pos: Position;
}

export type AssignTarget =
  | { kind: 'Name'; id: string; pos: Position }
  | { kind: 'Subscript'; value: Expr; index: Expr; pos: Position };

export interface AugAssign {
  kind: 'AugAssign';
  target: { kind: 'Name'; id: string; pos: Position };
  op: '+' | '-';
  value: Expr;
  pos: Position;
}

export interface ExprStmt {
  kind: 'ExprStmt';
  expr: Expr;
  pos: Position;
}

export interface If {
  kind: 'If';
  test: Expr;
  body: Stmt[];
  orelse: Stmt[]; // elif becomes nested If, else is flat list
  pos: Position;
}

export interface For {
  kind: 'For';
  target: string;
  rangeArgs: Expr[]; // 1, 2, or 3 args to range()
  body: Stmt[];
  pos: Position;
}

export interface While {
  kind: 'While';
  test: Expr;
  body: Stmt[];
  pos: Position;
}

export interface FuncDef {
  kind: 'FuncDef';
  name: string;
  params: string[];
  body: Stmt[];
  pos: Position;
}

export interface Return {
  kind: 'Return';
  value: Expr | null;
  pos: Position;
}

export interface Break {
  kind: 'Break';
  pos: Position;
}

export interface Continue {
  kind: 'Continue';
  pos: Position;
}

// ─── Program ─────────────────────────────────────────────────────────────────

export interface Program {
  kind: 'Program';
  body: Stmt[];
}
