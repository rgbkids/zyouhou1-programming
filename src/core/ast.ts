// AST Node definitions for the Jouhou-I language subset

export type ASTNode =
  | Program
  | AssignStmt
  | PrintStmt
  | IfStmt
  | ForStmt
  | WhileStmt
  | DefStmt
  | ReturnStmt
  | ExprStmt
  | BinOp
  | UnaryOp
  | Compare
  | BoolOp
  | NumberLiteral
  | StringLiteral
  | BoolLiteral
  | NoneLiteral
  | Identifier
  | ListLiteral
  | IndexAccess
  | FuncCall
  | AttributeAccess;

export interface Program {
  type: 'Program';
  body: Stmt[];
}

export type Stmt =
  | AssignStmt
  | PrintStmt
  | IfStmt
  | ForStmt
  | WhileStmt
  | DefStmt
  | ReturnStmt
  | ExprStmt;

export type Expr =
  | BinOp
  | UnaryOp
  | Compare
  | BoolOp
  | NumberLiteral
  | StringLiteral
  | BoolLiteral
  | NoneLiteral
  | Identifier
  | ListLiteral
  | IndexAccess
  | FuncCall
  | AttributeAccess;

export interface AssignStmt {
  type: 'AssignStmt';
  target: string;
  value: Expr;
  line: number;
}

export interface IndexAssignStmt {
  type: 'IndexAssignStmt';
  target: Expr;
  index: Expr;
  value: Expr;
  line: number;
}

export interface PrintStmt {
  type: 'PrintStmt';
  args: Expr[];
  line: number;
}

export interface IfStmt {
  type: 'IfStmt';
  test: Expr;
  body: Stmt[];
  orelse: Stmt[];
  line: number;
}

export interface ForStmt {
  type: 'ForStmt';
  target: string;
  iter: Expr;
  body: Stmt[];
  line: number;
}

export interface WhileStmt {
  type: 'WhileStmt';
  test: Expr;
  body: Stmt[];
  line: number;
}

export interface DefStmt {
  type: 'DefStmt';
  name: string;
  params: string[];
  body: Stmt[];
  line: number;
}

export interface ReturnStmt {
  type: 'ReturnStmt';
  value: Expr | null;
  line: number;
}

export interface ExprStmt {
  type: 'ExprStmt';
  expr: Expr;
  line: number;
}

export interface BinOp {
  type: 'BinOp';
  op: '+' | '-' | '*' | '/' | '//' | '%' | '**';
  left: Expr;
  right: Expr;
  line: number;
}

export interface UnaryOp {
  type: 'UnaryOp';
  op: '-' | 'not';
  operand: Expr;
  line: number;
}

export interface Compare {
  type: 'Compare';
  op: '==' | '!=' | '<' | '<=' | '>' | '>=';
  left: Expr;
  right: Expr;
  line: number;
}

export interface BoolOp {
  type: 'BoolOp';
  op: 'and' | 'or';
  left: Expr;
  right: Expr;
  line: number;
}

export interface NumberLiteral {
  type: 'NumberLiteral';
  value: number;
  line: number;
}

export interface StringLiteral {
  type: 'StringLiteral';
  value: string;
  line: number;
}

export interface BoolLiteral {
  type: 'BoolLiteral';
  value: boolean;
  line: number;
}

export interface NoneLiteral {
  type: 'NoneLiteral';
  line: number;
}

export interface Identifier {
  type: 'Identifier';
  name: string;
  line: number;
}

export interface ListLiteral {
  type: 'ListLiteral';
  elements: Expr[];
  line: number;
}

export interface IndexAccess {
  type: 'IndexAccess';
  target: Expr;
  index: Expr;
  line: number;
}

export interface FuncCall {
  type: 'FuncCall';
  callee: Expr;
  args: Expr[];
  line: number;
}

export interface AttributeAccess {
  type: 'AttributeAccess';
  object: Expr;
  attr: string;
  line: number;
}
