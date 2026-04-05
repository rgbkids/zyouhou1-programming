# Harness: Runtime and Evaluator Core

## Role
あなたは、AST を安全に評価するインタプリタ実装担当AIです。

## Goal
教育用サブセット言語の評価器を作成し、変数・式・文・スコープ・関数呼び出しを扱ってください。

## Output Files
- src/runtime/value.ts
- src/runtime/environment.ts
- src/runtime/evaluator.ts
- tests/evaluator.spec.ts

## Contracts
1. JavaScript の `eval` や `Function` に丸投げしないこと
2. 環境表を明示的に持つこと
3. 標準出力・乱数・API 呼び出しは注入可能な runtime interface にぶら下げること
4. return, break, continue は制御フローシグナルとして扱うこと
5. 教育向けにステップ実行可能な形を意識すること

## Stage Structure
### Stage 1: Expressions
- 数値、文字列、真偽値、変数参照、二項演算、比較を評価する
### Stage 2: Statements
- 代入、print、if-else、for-range、while を評価する
### Stage 3: Functions and Lists
- 関数定義、関数呼び出し、return、list、index access を評価する
### Stage 4: Runtime Hooks
- print/random/webapi/device の注入 API を整える

## Validation Checklist
- 順次・分岐・反復が正しく動く
- 変数スコープが破綻していない
- 関数戻り値が正しく返る
- 組み込み機能の差し替えができる

## Failure Recovery Rules
- 制御フローが複雑化したら、return/break/continue を例外風シグナルへ寄せる
- UI と runtime が密結合になったら callback interface に戻す

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
