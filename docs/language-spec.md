# Language Specification

## Purpose
本仕様は、情報I向けブラウザ実行型インタプリタの教育用サブセットを定義する。Python 風の読みやすさを保ちつつ、実装を複雑化する機能は除外する。

## Core Design
- ブロックは Python 風の `:` + インデントで表す
- 実装対象は `代入 / print / if-else / for-range / while / list / def-return` を最優先とする
- runtime は JavaScript の `eval` に依存せず、AST を直接評価する
- built-in module は `random`, `webapi`, `device` に限定する

## Lexical Rules
- 改行は文の区切りとして扱う
- インデントはブロック開始・終了に使う
- コメントは行コメント `# ...` のみ
- 識別子は英字または `_` で始まり、以降に英数字または `_` を許可する
- 数値は 10 進整数と小数を扱う
- 文字列はダブルクォート `"text"` を基本とする

## Supported Statements
- 代入: `x = 1`
- 出力: `print(x)`
- 条件分岐:
  ```info1
  if score >= 60:
      print("pass")
  else:
      print("fail")
  ```
- 反復:
  ```info1
  for i in range(1, 6, 1):
      print(i)

  while x < 10:
      x = x + 1
  ```
- 関数:
  ```info1
  def add1(x):
      return x + 1
  ```
- `return` は関数本体でのみ有効とする

## Expressions
- リテラル: 数値、文字列、真偽値、リスト
- 変数参照
- 二項演算: `+ - * / %`
- 比較演算: `== != < <= > >=`
- 単項演算: `-`, `not`
- 関数呼び出し: `name(arg1, arg2)`
- 添字参照: `a[0]`
- 属性付き built-in 呼び出し: `random.randrange(6)`, `webapi.get_json("zip", "1000001")`, `device.led_show("A")`

## Built-ins
- `print(value, ...)`: 標準出力へ文字列化して 1 行追加する
- `len(list)`: 要素数を返す
- `range(start, stop, step)`: `for` 専用の整数列を返す
- `random.randrange(n)`: `0` 以上 `n` 未満の整数を返す
- `webapi.get_json(name, params)`: allowlist または mock 経由で JSON を返す
- `device.*`: センサ値取得や LED 表示などの模擬 API を提供する

## Semantics
- 変数束縛は代入で作成する
- 関数はローカルスコープを持つ
- リストは 0 始まりで添字アクセスする
- 添字範囲外は実行時エラーとする
- `while` は step limit を持ち、暴走時は停止する
- 真偽値は `true` と `false` を予約語として扱う

## Out of Scope
- クラス、辞書、内包表記、例外処理
- `import`
- 任意入力、任意ネットワークアクセス
- 実機ハードウェア接続

## Parser Handoff Notes
- 再帰下降パーサを前提とし、文は `NEWLINE` 単位で区切る
- `if`, `for`, `while`, `def` は `:` の後にインデントされた `block` を取る
- `else` は直前の `if` にのみ結び付く
- `call`, `index`, `member` は左結合で連鎖可能にする
