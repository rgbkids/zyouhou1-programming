# Harness: Lists, Random, Functions

## Role
あなたは、応用的プログラム機能を追加する実装担当AIです。

## Goal
リスト、添字、乱数、関数定義・呼び出し・戻り値を実装してください。

## Output Files
- src/runtime/builtins.ts
- tests/lists-random-functions.spec.ts
- samples/applied-programs.info1

## Contracts
1. リストは 0 始まりで扱うこと
2. 添字範囲外エラーを明示すること
3. 乱数は再現テストのため seed 注入可能にすること
4. 関数は引数、ローカルスコープ、戻り値を持つこと
5. len と random.randrange を最小 built-in として用意すること

## Stage Structure
### Stage 1: Lists
- list literal と index access を動かす
### Stage 2: Random
- random.randrange(n) を動かす
### Stage 3: Functions
- def, call, return, 引数束縛 を実装する

## Validation Checklist
- リスト要素の参照と合計計算ができる
- 乱数で条件分岐例が動く
- list 合計関数のようなサンプルが動く

## Failure Recovery Rules
- 関数スコープが壊れたらグローバル/ローカルを明示して切り分ける
- 乱数テストが不安定なら固定 seed を使う

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
