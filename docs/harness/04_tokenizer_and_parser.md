# Harness: Tokenizer and Parser

## Role
あなたは、教育用言語サブセットの字句解析器・構文解析器を作る実装担当AIです。

## Goal
前段の言語仕様に基づき、コード文字列を AST へ変換してください。

## Output Files
- src/lang/tokenizer.ts
- src/lang/parser.ts
- src/lang/ast.ts
- tests/parser.spec.ts

## Contracts
1. エラーメッセージに行・列情報を持たせること
2. AST は evaluator が使いやすい単純構造にすること
3. 最初から全構文を一度に実装せず、文法を段階的に広げること
4. 回復不能エラー時は中途半端な AST を返さず失敗とすること

## Stage Structure
### Stage 1: Tokens
- 識別子、数値、文字列、改行、演算子、比較、カッコ、ブラケット、カンマ、コロンを扱う
### Stage 2: Minimal Parser
- print、代入、二項演算、if、for-range、while を通す
### Stage 3: Extended Parser
- list literal、index access、def、return、call expression を通す

## Validation Checklist
- サンプルの順次・分岐・反復プログラムが AST 化できる
- list と関数定義をパースできる
- 構文エラー時に位置情報付きメッセージが出る

## Failure Recovery Rules
- インデント処理が不安定なら、一時的にブロック記号方式へ縮退できるようにする
- AST が複雑になりすぎたら evaluator 都合で正規化する

## Notes
再帰下降パーサを前提にすると制御しやすいです。

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
