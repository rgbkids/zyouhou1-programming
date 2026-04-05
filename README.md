# 情報I ブラウザインタプリタ

「情報I」に対応した、ブラウザで動く教育用プログラミング環境です。

## 特徴

- **Monaco Editor** を使ったコードエディタ（シンタックスハイライト付き）
- Python 風教育用言語 **info1** のインタプリタ（`eval()` 不使用・純粋 AST 評価）
- 順次・分岐・反復・変数・リスト・乱数・関数に対応
- アルゴリズム教材（線形探索・二分探索・選択ソート・クイックソート）
- 浮動小数点誤差デモ + 回避例
- デバイスシミュレータ（加速度センサ・温度・照度・LED 模擬）
- モデル化・シミュレーション教材（サイコロ・コイン投げ）

## クイックスタート

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## テスト

```bash
npm run test
```

## ドキュメント

- [言語仕様](docs/language-spec.md)
- [文法定義（EBNF）](docs/grammar.ebnf.md)
- [適合性マトリクス](docs/conformance-matrix.md)
- [機能分解表](docs/feature-breakdown.md)
- [WebAPI ポリシー](docs/webapi-policy.md)
- [アルゴリズム解説](docs/algorithm-notes.md)
- [計算誤差解説](docs/numeric-error-notes.md)
- [シミュレーション解説](docs/simulation-notes.md)
- [テストマトリクス](docs/test-matrix.md)
- [Runbook（操作手順）](docs/runbook.md)

## スタック

- TypeScript + React 19 + Vite 8
- @monaco-editor/react 4
- Vitest 3