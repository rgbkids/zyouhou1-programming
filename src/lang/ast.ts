export type Program = {
  type: "Program";
  body: Statement[];
};

export type Statement =
  | AssignmentStatement
  | ExpressionStatement
  | PrintStatement
  | ReturnStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | FunctionDefinition;

export type AssignmentStatement = {
  type: "AssignmentStatement";
  target: Identifier;
  value: Expression;
};

export type ExpressionStatement = {
  type: "ExpressionStatement";
  expression: Expression;
};

export type PrintStatement = {
  type: "PrintStatement";
  arguments: Expression[];
};

export type ReturnStatement = {
  type: "ReturnStatement";
  value: Expression;
};

export type IfStatement = {
  type: "IfStatement";
  condition: Expression;
  thenBranch: Statement[];
  elseBranch: Statement[] | null;
};

export type ForStatement = {
  type: "ForStatement";
  iterator: Identifier;
  iterable: CallExpression;
  body: Statement[];
};

export type WhileStatement = {
  type: "WhileStatement";
  condition: Expression;
  body: Statement[];
};

export type FunctionDefinition = {
  type: "FunctionDefinition";
  name: Identifier;
  parameters: Identifier[];
  body: Statement[];
};

export type Expression =
  | Identifier
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | ListLiteral
  | UnaryExpression
  | BinaryExpression
  | CallExpression
  | IndexExpression
  | MemberExpression;

export type Identifier = {
  type: "Identifier";
  name: string;
};

export type NumericLiteral = {
  type: "NumericLiteral";
  value: number;
  raw: string;
};

export type StringLiteral = {
  type: "StringLiteral";
  value: string;
};

export type BooleanLiteral = {
  type: "BooleanLiteral";
  value: boolean;
};

export type ListLiteral = {
  type: "ListLiteral";
  elements: Expression[];
};

export type UnaryExpression = {
  type: "UnaryExpression";
  operator: "-" | "not";
  argument: Expression;
};

export type BinaryExpression = {
  type: "BinaryExpression";
  operator:
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "=="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">=";
  left: Expression;
  right: Expression;
};

export type CallExpression = {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
};

export type IndexExpression = {
  type: "IndexExpression";
  target: Expression;
  index: Expression;
};

export type MemberExpression = {
  type: "MemberExpression";
  object: Expression;
  property: Identifier;
};
