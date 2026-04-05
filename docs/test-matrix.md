# テストマトリクス

各機能に対するテストケースと期待出力の一覧です。

## コア言語機能

| 機能 | テストファイル | ケース数 | 状態 |
|------|-------------|---------|------|
| トークナイザ | parser.spec.ts | 7 | ✓ |
| パーサ（代入・式） | parser.spec.ts | 5 | ✓ |
| パーサ（制御フロー） | parser.spec.ts | 4 | ✓ |
| パーサ（関数） | parser.spec.ts | 3 | ✓ |
| 評価器（式） | evaluator.spec.ts | 8 | ✓ |
| 評価器（変数） | evaluator.spec.ts | 3 | ✓ |
| 評価器（組み込み） | evaluator.spec.ts | 7 | ✓ |

## I/O

| 機能 | テストファイル | ケース数 | 状態 |
|------|-------------|---------|------|
| IOBuffer | io.spec.ts | 5 | ✓ |
| print 出力 | io.spec.ts | 5 | ✓ |

## 制御フロー

| 機能 | テストファイル | ケース数 | 状態 |
|------|-------------|---------|------|
| 順次実行 | control-flow.spec.ts | 1 | ✓ |
| if/elif/else | control-flow.spec.ts | 4 | ✓ |
| for ループ | control-flow.spec.ts | 5 | ✓ |
| while ループ | control-flow.spec.ts | 4 | ✓ |

## 応用機能

| 機能 | テストファイル | ケース数 | 状態 |
|------|-------------|---------|------|
| リスト | lists-random-functions.spec.ts | 6 | ✓ |
| 乱数 | lists-random-functions.spec.ts | 3 | ✓ |
| 関数 | lists-random-functions.spec.ts | 5 | ✓ |

## 教材機能

| 機能 | テストファイル | ケース数 | 状態 |
|------|-------------|---------|------|
| WebAPI allowlist | webapi.spec.ts | 4 | ✓ |
| デバイス模擬 | device.spec.ts | 5 | ✓ |

## サンプルプログラム（golden tests）

| サンプル | テストファイル | 検証内容 |
|---------|-------------|---------|
| 順次・分岐・反復 | examples.spec.ts | 出力の完全一致 |
| 線形探索 | examples.spec.ts | 発見インデックスの確認 |
| 選択ソート | examples.spec.ts | ソート結果の確認 |
| 浮動小数点誤差 | examples.spec.ts | 誤差の存在・整数回避の正確性 |
| 再帰関数 | examples.spec.ts | 階乗計算 |
| 乱数（seed固定） | examples.spec.ts | 合計回数が試行回数と一致 |
| デバイス | examples.spec.ts | センサ値による分岐 |

## 統合テスト

| テスト | ファイル | 内容 |
|--------|---------|------|
| pipeline | integration.spec.ts | parse→eval→output の完全パイプライン |
| エラーメッセージ | integration.spec.ts | 構文エラー・実行エラーの日本語メッセージ |
| 全サンプル構文チェック | integration.spec.ts | 全15サンプルがパースエラーなし |
