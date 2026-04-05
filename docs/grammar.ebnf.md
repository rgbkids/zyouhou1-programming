# info1 文法定義（EBNF）

```ebnf
program     = stmt* EOF ;

stmt        = assign_stmt
            | if_stmt
            | for_stmt
            | while_stmt
            | def_stmt
            | return_stmt
            | break_stmt
            | continue_stmt
            | pass_stmt
            | expr_stmt ;

assign_stmt = NAME "=" expr NEWLINE
            | NAME "[" expr "]" "=" expr NEWLINE ;

if_stmt     = "if" expr ":" NEWLINE block
              ("elif" expr ":" NEWLINE block)*
              ("else" ":" NEWLINE block)? ;

for_stmt    = "for" NAME "in" expr ":" NEWLINE block ;

while_stmt  = "while" expr ":" NEWLINE block ;

def_stmt    = "def" NAME "(" params ")" ":" NEWLINE block ;

params      = (NAME ("," NAME)*)? ;

return_stmt = "return" expr? NEWLINE ;

break_stmt  = "break" NEWLINE ;

continue_stmt = "continue" NEWLINE ;

pass_stmt   = "pass" NEWLINE ;

expr_stmt   = expr NEWLINE ;

block       = INDENT stmt+ DEDENT ;

(* 式 - 優先順位: 低い順 *)
expr        = or_expr ;

or_expr     = and_expr ("or" and_expr)* ;

and_expr    = not_expr ("and" not_expr)* ;

not_expr    = "not" not_expr | cmp_expr ;

cmp_expr    = add_expr (cmp_op add_expr)* ;

cmp_op      = "==" | "!=" | "<" | "<=" | ">" | ">=" ;

add_expr    = mul_expr (("+"|"-") mul_expr)* ;

mul_expr    = pow_expr (("*"|"/"|"//"|"%") pow_expr)* ;

pow_expr    = unary_expr ("**" unary_expr)* ;

unary_expr  = "-" unary_expr | primary_expr ;

primary_expr = atom_expr suffix* ;

suffix      = "[" expr "]"              (* index access *)
            | "(" args ")"              (* function call *)
            | "." NAME                  (* attribute access *)
            ;

atom_expr   = NUMBER
            | STRING
            | "True"
            | "False"
            | "None"
            | NAME
            | "(" expr ")"
            | "[" list_items "]"
            ;

list_items  = (expr ("," expr)* ","?)? ;

args        = (expr ("," expr)*)? ;

(* トークン *)
NUMBER      = [0-9]+ ("." [0-9]+)? ;
STRING      = '"' [^"\n]* '"' | "'" [^'\n]* "'" ;
NAME        = [a-zA-Z_] [a-zA-Z0-9_]* ;
NEWLINE     = "\n" ;
INDENT      = (インデントレベルが増加した行頭) ;
DEDENT      = (インデントレベルが減少した行頭) ;
EOF         = (入力終端) ;

(* キーワード - NAME として字句解析後に区別 *)
keywords    = "if" | "elif" | "else" | "for" | "in" | "while"
            | "def" | "return" | "break" | "continue" | "pass"
            | "True" | "False" | "None" | "and" | "or" | "not" ;
```
