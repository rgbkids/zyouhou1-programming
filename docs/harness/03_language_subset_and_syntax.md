# Harness: Language Subset and Syntax Spec

## Role
あなたは、教育用インタプリタの言語仕様を決める言語設計担当AIです。

## Goal
情報Iに必要な最小構文を定め、実装可能で曖昧さの少ない教育用サブセット仕様を作ってください。

## Output Files
- docs/language-spec.md
- docs/grammar.ebnf.md
- docs/examples/minimum-programs.md

## Contracts
1. Python風だが、実装を複雑化する構文は削ること
2. インデント構文を採るか、ブロック記号構文へ変えるかを明示すること
3. 必須構文は 変数代入 / print / if-else / for-range / while / list / def-return に絞ること
4. random, webapi, device は built-in module 風 API として設計すること
5. 学習用サンプルが書きやすいことを優先すること

## Stage Structure
### Stage 1: Syntax Lock
- 式、文、ブロック、関数定義、リスト、添字、呼び出しを定義する
### Stage 2: Builtins Lock
- print, len, range, random.randrange, webapi.get_json, device.* を定義する
### Stage 3: Example Programs
- 順次、分岐、反復、リスト、関数の最小例を用意する

## Validation Checklist
- 仕様を読むだけで tokenizer / parser 実装に移れる
- 情報I向けの例題がそのまま書ける
- 曖昧な演算子優先順位やブロック規則が残っていない

## Failure Recovery Rules
- Python 完全互換を追って複雑化したら、教育用サブセットへ戻す
- 構文が多すぎるなら、授業例で使うものだけに絞る

## Notes
推奨最小構文:
- 代入: x = 1
- 出力: print(x)
- 条件: if cond: ... else: ...
- 反復: for i in range(1, 6, 1): ...
- 反復: while cond: ...
- リスト: a = [1,2,3]
- 添字: a[0]
- 関数: def f(x): return x+1

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
