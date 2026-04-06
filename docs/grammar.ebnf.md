# Grammar (EBNF)

```ebnf
program         = { statement } EOF ;

statement       = simple_statement NEWLINE
                | if_statement
                | for_statement
                | while_statement
                | function_def ;

simple_statement = assignment
                 | print_statement
                 | return_statement
                 | expression ;

assignment      = IDENT "=" expression ;
print_statement  = "print" "(" [ argument_list ] ")" ;
return_statement = "return" expression ;

if_statement    = "if" expression ":" NEWLINE INDENT block DEDENT
                  [ "else" ":" NEWLINE INDENT block DEDENT ] ;

for_statement   = "for" IDENT "in" range_call ":" NEWLINE INDENT block DEDENT ;
while_statement = "while" expression ":" NEWLINE INDENT block DEDENT ;

function_def    = "def" IDENT "(" [ parameter_list ] ")" ":"
                  NEWLINE INDENT block DEDENT ;

block           = { statement } ;

parameter_list  = IDENT { "," IDENT } ;
argument_list   = expression { "," expression } ;

range_call      = "range" "(" expression "," expression "," expression ")" ;

expression      = logic_not ;
logic_not       = [ "not" ] comparison ;
comparison      = additive { comp_op additive } ;
comp_op         = "==" | "!=" | "<" | "<=" | ">" | ">=" ;
additive        = multiplicative { ("+" | "-") multiplicative } ;
multiplicative  = unary { ("*" | "/" | "%") unary } ;
unary           = [ "-" ] postfix ;

postfix         = primary { call_suffix | index_suffix | member_suffix } ;
call_suffix     = "(" [ argument_list ] ")" ;
index_suffix    = "[" expression "]" ;
member_suffix   = "." IDENT ;

primary         = NUMBER
                | STRING
                | "true"
                | "false"
                | IDENT
                | list_literal
                | "(" expression ")" ;

list_literal    = "[" [ argument_list ] "]" ;
```

## Notes
- `INDENT` と `DEDENT` は tokenizer が生成する仮想トークンとする。
- 最小実装では `assignment` の左辺は `IDENT` のみとし、`a[0] = 1` は後回しにする。
- `range` はまず 3 引数固定とする。
- `print` は文として扱うが、内部的に built-in call として正規化してよい。
