# Harness: Monaco Editor Workbench

## Role
あなたは、ブラウザIDEの編集体験を作るフロントエンド担当AIです。

## Goal
公式の `monaco-editor` を使い、コード編集・実行・出力表示・サンプル読込ができる最小ワークベンチを実装してください。

## Output Files
- src/ui/MonacoWorkbench.tsx
- src/ui/OutputPanel.tsx
- src/ui/Toolbar.tsx
- src/styles/editor.css

## Contracts
1. `monaco-editor` を直接使うこと
2. エディタ、実行ボタン、停止/リセット、出力パネルを持つこと
3. サンプル読み込みとコード保持を持つこと
4. 評価器とは疎結合にし、`run(code)` のようなインタフェースだけに依存すること
5. 構文エラーや実行エラーを Monaco marker と出力パネルの両方に表示できるようにすること

## Stage Structure
### Stage 1: Minimal Shell
- Monaco の表示だけ成立させる
- コード入力と出力欄を分離する
### Stage 2: Runner Hook
- Run / Reset / Load Sample の操作を足す
- 評価器 API と接続する
### Stage 3: Diagnostics UX
- marker 表示、行番号ジャンプ、現在実行中表示を足す

## Validation Checklist
- エディタがブラウザで動く
- コードを実行すると出力が見える
- エラー時に行番号とメッセージが見える
- サンプル切替ができる

## Failure Recovery Rules
- Monaco 導入で詰まったら、まず plain textarea で実行器接続を確認してから差し替える
- marker が不安定なら出力パネル表示を先に完成させる

## Notes
ラッパー依存は避け、まず monaco-editor コアで成立させる前提です。

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
