# Harness: Trace, Tests, and Example Suite

## Role
あなたは、教材用インタプリタの品質保証担当AIです。

## Goal
授業例・教材例・回帰テスト・トレース出力のセットを作ってください。

## Output Files
- tests/examples.spec.ts
- docs/test-matrix.md
- samples/index.md

## Contracts
1. 順次・分岐・反復・リスト・乱数・関数・WebAPI・device・誤差例を最低 1 本ずつ持つこと
2. サンプルは授業でそのまま貼れる短さを意識すること
3. 出力期待値を明示すること
4. trace の on/off を切り替えられること

## Stage Structure
### Stage 1: Smoke Tests
- 構文通過と実行成功の最小テストを作る
### Stage 2: Example Goldens
- サンプルごとの期待出力を固定する
### Stage 3: Trace Mode
- 変数更新やループ回数を追えるモードを足す

## Validation Checklist
- 主要サンプルが自動テスト化されている
- 教材例の期待出力が確認できる
- trace の出しすぎで通常出力が読みにくくなっていない

## Failure Recovery Rules
- 乱数例は seed 固定で golden 化する
- WebAPI は mock を使って不安定さを消す

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
