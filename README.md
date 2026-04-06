# 情報I ブラウザインタプリタ

日本の高校「情報I」授業で使える、ブラウザで動く Python 風教育用インタプリタです。

## 起動方法

```bash
pnpm install   # 初回のみ
pnpm dev       # 開発サーバー起動 → http://localhost:5173
```

## ビルド・テスト

```bash
pnpm build     # dist/ に配布物を生成
pnpm test      # vitest でテスト実行
```

## 機能

- **Monaco エディタ** でコードを書いて ▶ 実行
- **サンプルプログラム**: 基本・応用・アルゴリズム・教材の各カテゴリ
- **デバイス模擬パネル**: 加速度センサ・温度・照度・LED 表示をブラウザ上で模擬
- **浮動小数点ヒント**: 誤差の理由を常時説明

## 対応言語機能

| 機能 | 状態 |
|------|------|
| 変数・代入・算術演算 | ✅ |
| if / elif / else | ✅ |
| for range / while | ✅ |
| リスト・添字 | ✅ |
| 関数定義・呼び出し・return | ✅ |
| print / len / range / int / float / str | ✅ |
| random.randrange | ✅ |
| device.* (模擬) | ✅ |
| break / continue | ✅ |
| 無限ループ防止 (100,000 ステップ上限) | ✅ |

## ファイル構成

```
src/
  lang/          tokenizer, parser, AST 型定義
  runtime/       evaluator, environment, io, device, webapi
  ui/            React コンポーネント
  samples/       サンプルプログラム一覧
docs/
  conformance-matrix.md   情報I 適合性マトリクス
  feature-breakdown.md    機能分解表
  language-spec.md        言語仕様
  grammar.ebnf.md         文法定義 (EBNF)
samples/           .info1 サンプルファイル
tests/             vitest テスト
```

## 制約事項

- WebAPI (`webapi.get_json`) はデフォルトでは無効（allowlist 方式・CORS の問題あり）
- `input()` は未実装（固定値 mock で代替可能）
- クラス・例外処理は対象外
