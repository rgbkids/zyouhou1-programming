# Runbook: 情報I ブラウザインタプリタ

## 起動方法

### 開発サーバー

```bash
npm install   # 初回のみ
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### ビルド（配布用）

```bash
npm run build
npm run preview   # ビルド確認
```

`dist/` フォルダに静的ファイルが生成されます。

### テスト実行

```bash
npm run test
```

---

## 画面構成

```
┌─────────────────────────────────────────────────┐
│  Toolbar: 実行 | 停止 | クリア | サンプル選択     │
├──────────────────────┬──────────────────────────┤
│                      │  ConsolePanel (出力)      │
│  Monaco Editor       ├──────────────────────────┤
│  (コードエディタ)    │  DevicePanel (センサ)    │
│                      ├──────────────────────────┤
│                      │  NumericHintPanel (誤差)  │
└──────────────────────┴──────────────────────────┘
```

---

## サンプルプログラムの使い方

1. ツールバーの「サンプルを選択」ドロップダウンからサンプルを選ぶ
2. エディタにコードが読み込まれる
3. 「▶ 実行」ボタンを押す（または `Ctrl+Enter`）
4. 右側の出力パネルに結果が表示される

---

## デバイスシミュレータの使い方

1. サンプルで「デバイスシミュレータ」を選択
2. 右下のスライダーで加速度・温度・照度を調整
3. 実行するとセンサ値に応じた動作が確認できる

---

## ファイル構成

```
src/
├── lang/
│   ├── ast.ts          AST ノード型定義
│   ├── tokenizer.ts    字句解析器
│   └── parser.ts       構文解析器（再帰下降）
├── runtime/
│   ├── value.ts        実行時値の型
│   ├── environment.ts  変数スコープ
│   ├── io.ts           I/O バッファ
│   ├── control-flow.ts 制御フローシグナル
│   ├── builtins.ts     組み込み関数・モジュール
│   ├── evaluator.ts    ツリーウォーキング評価器
│   ├── webapi.ts       WebAPI 安全レイヤ
│   ├── allowlist.ts    許可 API 一覧
│   └── device.ts       デバイス模擬
├── ui/
│   ├── MonacoWorkbench.tsx  メイン UI コンポーネント
│   ├── Toolbar.tsx          ツールバー
│   ├── ConsolePanel.tsx     出力パネル
│   ├── DevicePanel.tsx      デバイスシミュレータ
│   └── NumericHintPanel.tsx 浮動小数点誤差ヒント
├── samples/
│   └── index.ts        サンプルプログラム一覧
├── App.tsx
└── main.tsx
```

---

## 言語仕様の概要

- Python 風インデントベース構文
- 変数・代入・算術・比較・論理演算
- if/elif/else, for-range, while
- リスト（0-indexed）、関数定義（def/return）
- 組み込み: print, len, range, int, float, str, abs, input
- モジュール: random, webapi, device

詳細は [docs/language-spec.md](language-spec.md) を参照。

---

## 制約事項

- クラス・例外処理・import 文は非対応
- ループの最大ステップ数: 100,000
- WebAPI は allowlist 登録済みのみ呼び出し可能
- 実機デバイス（micro:bit 等）への直接接続は非対応（模擬のみ）
