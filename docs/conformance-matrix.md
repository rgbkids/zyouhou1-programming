# Conformance Matrix

## Purpose
情報Iで扱う主要項目を、ブラウザ実装でどう成立させるかに写像する。ここでは `Must / Should / Optional` を固定し、後続ハーネスへの受け渡しを明確にする。

## Coverage Table
| 項目 | 分類 | 優先度 | 実現方針 | 担当ハーネス |
| --- | --- | --- | --- | --- |
| 順次実行、変数、代入、算術 | 言語機能 | Must | 最小言語コアとして実装 | `03`, `04`, `05` |
| 条件分岐 `if/else` | 言語機能 | Must | AST ベースで評価 | `03`, `04`, `05`, `07` |
| 反復 `for/range`, `while` | 言語機能 | Must | 制御フロー文として実装 | `03`, `04`, `05`, `07` |
| 標準出力 `print` | 言語機能 | Must | 出力バッファ経由で UI へ連携 | `05`, `06`, `14` |
| リスト、添字、`len` | 言語機能 | Must | 教材例で使う最小機能を実装 | `03`, `04`, `05`, `08` |
| 関数、`return` | 言語機能 | Must | 明示的スコープで実装 | `03`, `04`, `05`, `08` |
| 乱数 `random` | 模擬API | Must | seed 固定可能な built-in として実装 | `03`, `05`, `08`, `15` |
| Monaco ベース IDE | 教材UI | Must | エディタ、実行、出力、サンプル読込 | `02`, `14` |
| 構文/実行エラー表示 | 教材UI | Must | Monaco marker と出力パネルで提示 | `02`, `14` |
| WebAPI 学習 | 模擬API | Should | allowlist または mock-first | `03`, `09`, `15` |
| 外部装置の計測・制御 | 模擬API | Should | ブラウザ内 device simulation で代替 | `03`, `10`, `14` |
| 計算誤差の説明 | 教材UI | Should | 誤差再現サンプルと補助パネル | `12`, `15` |
| 線形探索、二分探索 | サンプルプログラム | Should | 教材サンプルと trace で提示 | `11`, `15` |
| 選択ソート、クイックソート | サンプルプログラム | Should | 参照実装と比較観点を提供 | `11`, `15` |
| モデル化とシミュレーション | サンプルプログラム | Should | 乱数 + 反復 + 集計の例を提供 | `13`, `15` |
| 実行トレース | 教材UI | Should | 通常出力と分離して on/off 可能にする | `05`, `15`, `14` |
| 可視化の強化 | 教材UI | Optional | 余力があればパネルや統計表示を追加 | `11`, `12`, `13`, `14` |
| 実機デバイス直結 | 対象外 | Optional | 今回は実装しない。模擬で代替 | 対象外 |
| 任意 URL への通信 | 対象外 | Optional | セキュリティ上許可しない | 対象外 |

## Priority Rules
- Must は MVP に含める。授業で最低限デモできる状態を作る。
- Should は情報Iの理解支援に重要だが、core 安定後に追加する。
- Optional は統合後の余力で判断する。

## Browser Constraints
- 外部装置は実機連携ではなく UI 模擬に置き換える。
- WebAPI は allowlist か mock を前提にし、自由通信は許可しない。
- 数値誤差やアルゴリズム比較は言語コアではなく教材レイヤで扱う。

## Handoff Notes
- `03_language_subset_and_syntax.md` は built-in API 名を確定する。
- `05_runtime_and_evaluator.md` は UI 非依存の runtime hook を提供する。
- `15_trace_tests_and_examples.md` は Must 項目を最低 1 本ずつサンプル化する。
