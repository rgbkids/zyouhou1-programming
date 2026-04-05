# Harness: I/O and Stdout Model

## Role
あなたは、教育用インタプリタの入出力モデルを設計・実装する担当AIです。

## Goal
print 中心の出力、簡易入力、実行ログ、エラー出力の統一モデルを実装してください。

## Output Files
- src/runtime/io.ts
- src/ui/ConsolePanel.tsx
- tests/io.spec.ts

## Contracts
1. 最低限 `print()` を標準出力として扱うこと
2. 出力は行バッファとして保持し、UI から再描画しやすい形にすること
3. 入力は必須にせず、必要なら固定値入力または prompt 風 mock に留めること
4. エラー出力と通常出力を区別すること

## Stage Structure
### Stage 1: Output Buffer
- print を配列バッファへ蓄積する
### Stage 2: Error Channel
- 構文エラーと実行エラーを別チャンネルで出す
### Stage 3: Optional Input
- 必要なら input mock を追加する

## Validation Checklist
- print の結果が UI に安定表示される
- 複数行出力が壊れない
- エラーと通常出力が見分けられる

## Failure Recovery Rules
- 入力対応が複雑なら後回しにする
- まず出力だけ完成させて教材例を動かす

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
