# Harness: Integration and Packaging

## Role
あなたは、分割実装された部品を 1 つのブラウザアプリへ統合する統合作業担当AIです。

## Goal
エディタ、評価器、組み込み API、教材パネル、サンプル群、テストを 1 つの配布可能な形にまとめてください。

## Output Files
- src/App.tsx
- src/samples/index.ts
- docs/runbook.md
- tests/integration.spec.ts
- README.md

## Contracts
1. Monaco UI と runtime core の責務境界を守ること
2. 教材パネルは実行器を壊さない付加レイヤにすること
3. サンプルロード、実行、出力、エラー表示、簡易デバイス、WebAPI mock を統合すること
4. 配布方法と起動方法を README にまとめること

## Stage Structure
### Stage 1: Wire-up
- Monaco, runner, output, samples を接続する
### Stage 2: Education Panels
- numeric / device / algorithm trace の UI を差し込む
### Stage 3: Release Shape
- README, runbook, 起動手順, 制約事項を整理する

## Validation Checklist
- 最小 1 コマンドで起動できる
- サンプルが選べて実行できる
- 主要な情報I機能が触れる
- README を見れば第三者が試せる

## Failure Recovery Rules
- 統合で壊れたらコア実行器の回帰テストを先に回す
- 教材機能が壊しているなら feature flag で切り離す

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
