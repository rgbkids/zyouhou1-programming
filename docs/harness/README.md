# 情報Iブラウザインタプリタ用 テンプレート駆動型ハーネス集

このフォルダは、**「情報I」の仕様を満たすブラウザで動くインタプリタ**を、
**テンプレート駆動型開発**で作るための md ファイル群です。

狙いは次の 3 つです。

1. 上位の大きな要求を、下位の小さな実装単位へ分解する
2. 各下位機能ごとに、AI がそのまま読める「指示書」を持つ
3. 下位テンプレートを上位テンプレートへ渡し、段階的に統合する

## 使い方

- まず `00_master_instruction.md` を上位オーケストレータ用の親ハーネスとして使います。
- 次に、必要な下位テンプレートを個別セッションまたは個別タスクに渡して実装させます。
- 下位テンプレートで生成した成果物を、最後に `14_integration_packaging.md` で統合します。
- 再利用向けの一般化は `99_template_to_boilerplate.md` を使います。

## 想定スタック

- TypeScript
- ブラウザで動く単一ページアプリ
- `monaco-editor` を使ったコードエディタ
- AST ベースまたは安全な中間表現ベースの実行器
- 必要に応じて Web Worker を使った安全な実行分離

## 情報I対応の観点

このテンプレート群では、次をカバー対象として扱います。

- 基本的プログラム: 順次 / 分岐 / 反復 / 変数
- 応用的プログラム: 配列（リスト）/ 乱数 / 関数 / WebAPI
- アルゴリズムの比較: 線形探索 / 二分探索 / 選択ソート / クイックソート
- 計算誤差: 浮動小数点の誤差表示と解説支援
- 外部装置との接続: 実機直結ではなく、ブラウザ上のセンサ / アクチュエータ模擬レイヤ
- モデル化とシミュレーション: 乱数・反復・記録による簡易シミュレーション

## ファイル一覧

### 上位ハーネス
- `00_master_instruction.md`
- `01_scope_and_conformance_matrix.md`

### コア実装テンプレート
- `02_monaco_editor_workbench.md`
- `03_language_subset_and_syntax.md`
- `04_tokenizer_and_parser.md`
- `05_runtime_and_evaluator.md`
- `06_io_and_stdout.md`
- `07_control_flow.md`
- `08_lists_random_functions.md`

### 教材機能テンプレート
- `09_webapi_and_browser_sandbox.md`
- `10_device_simulation.md`
- `11_algorithms_and_reference_programs.md`
- `12_precision_and_numeric_errors.md`
- `13_modeling_and_simulation.md`

### 統合・品質テンプレート
- `14_integration_packaging.md`
- `15_trace_tests_and_examples.md`
- `99_template_to_boilerplate.md`

## 推奨実行順

1. `01_scope_and_conformance_matrix.md`
2. `02_monaco_editor_workbench.md`
3. `03_language_subset_and_syntax.md`
4. `04_tokenizer_and_parser.md`
5. `05_runtime_and_evaluator.md`
6. `06_io_and_stdout.md`
7. `07_control_flow.md`
8. `08_lists_random_functions.md`
9. `09_webapi_and_browser_sandbox.md`
10. `10_device_simulation.md`
11. `12_precision_and_numeric_errors.md`
12. `11_algorithms_and_reference_programs.md`
13. `13_modeling_and_simulation.md`
14. `15_trace_tests_and_examples.md`
15. `14_integration_packaging.md`
16. `99_template_to_boilerplate.md`

## 命名ルール

各 md は共通して次の形を持ちます。

- Goal
- Output Files
- Contracts
- Stage Structure
- Validation Checklist
- Failure Recovery Rules
- Final Output Format

これにより、上位テンプレートから下位テンプレートへの受け渡しが安定します。
