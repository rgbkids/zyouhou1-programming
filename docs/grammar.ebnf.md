# 文法定義 (EBNF)

```ebnf
program        = { statement } ;

statement      = simple_stmt NEWLINE
               | compound_stmt ;

simple_stmt    = assign_stmt
               | expr_stmt
               | return_stmt
               | break_stmt
               | continue_stmt ;

assign_stmt    = target "=" expr
               | target "+=" expr
               | target "-=" expr ;

target         = NAME
               | NAME "[" expr "]" ;

expr_stmt      = expr ;

return_stmt    = "return" [ expr ] ;
break_stmt     = "break" ;
continue_stmt  = "continue" ;

compound_stmt  = if_stmt
               | for_stmt
               | while_stmt
               | funcdef ;

if_stmt        = "if" expr ":" suite
                 { "elif" expr ":" suite }
                 [ "else" ":" suite ] ;

for_stmt       = "for" NAME "in" range_call ":" suite ;

range_call     = "range" "(" expr [ "," expr [ "," expr ] ] ")" ;

while_stmt     = "while" expr ":" suite ;

funcdef        = "def" NAME "(" [ params ] ")" ":" suite ;

params         = NAME { "," NAME } ;

suite          = NEWLINE INDENT { statement } DEDENT ;

expr           = or_expr ;

or_expr        = and_expr { "or" and_expr } ;
and_expr       = not_expr { "and" not_expr } ;
not_expr       = "not" not_expr | comparison ;

comparison     = add_expr { comp_op add_expr } ;
comp_op        = "==" | "!=" | "<" | ">" | "<=" | ">=" ;

add_expr       = mul_expr { ("+" | "-") mul_expr } ;
mul_expr       = unary_expr { ("*" | "/" | "//" | "%") unary_expr } ;
unary_expr     = "-" unary_expr | power_expr ;
power_expr     = primary [ "**" unary_expr ] ;

primary        = atom { trailer } ;
trailer        = "(" [ arg_list ] ")"
               | "[" expr "]"
               | "." NAME "(" [ arg_list ] ")" ;

arg_list       = expr { "," expr } ;

atom           = NUMBER
               | STRING
               | "True" | "False" | "None"
               | NAME
               | "[" [ expr_list ] "]"
               | "(" expr ")" ;

expr_list      = expr { "," expr } [ "," ] ;

NUMBER         = INTEGER | FLOAT ;
INTEGER        = DIGIT { DIGIT } ;
FLOAT          = DIGIT { DIGIT } "." { DIGIT } ;
STRING         = '"' { CHAR } '"' | "'" { CHAR } "'" ;
NAME           = LETTER { LETTER | DIGIT | "_" } ;
```
