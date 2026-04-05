# Plan: Info I Browser Interpreter

## Objective
`docs/harness/README.md` に従い、情報I対応のブラウザ実行型インタプリタを段階的に構築する。最終成果物は、`monaco-editor` ベースのブラウザ IDE、分離された runtime core、安全な実行環境、教材向け補助パネル、サンプルとテスト一式とする。

## Scope Baseline
最初に `01_scope_and_conformance_matrix.md` を使って要求を固定する。必須対象は、順次・分岐・反復・変数・リスト・乱数・関数・標準出力・探索/ソート教材・計算誤差デモ・模擬 WebAPI・模擬 device・簡易シミュレーションとする。実機直結の外部装置連携は対象外とし、ブラウザ内模擬レイヤで代替する。

## Delivery Stages
### Stage 1: Scope Lock
- 対応範囲を `言語機能 / 教材UI / 模擬API / サンプルプログラム` に分類する
- `docs/conformance-matrix.md` と `docs/feature-breakdown.md` を作る
- Must / Should / Optional を確定する

### Stage 2: Core Workbench
- `02_monaco_editor_workbench.md` で Monaco ベースの編集 UI を用意する
- `03_language_subset_and_syntax.md` で言語仕様を固定する
- `04_tokenizer_and_parser.md` で AST または安全な中間表現を構築する

### Stage 3: Runtime Core
- `05_runtime_and_evaluator.md` で Monaco 非依存の評価器を実装する
- `06_io_and_stdout.md` で `print` と出力バッファを実装する
- `07_control_flow.md` で `if/else`, `for/range`, `while` を実装する
- `08_lists_random_functions.md` で list, `len`, `range`, `random`, `def/return` を追加する

### Stage 4: Education Features
- `09_webapi_and_browser_sandbox.md` で許可済み API と sandbox を整備する
- `10_device_simulation.md` で device 模擬レイヤを追加する
- `12_precision_and_numeric_errors.md` で誤差デモと説明 UI を追加する
- `11_algorithms_and_reference_programs.md` で探索・ソート教材を用意する
- `13_modeling_and_simulation.md` で乱数・反復・記録によるシミュレーション例を追加する

### Stage 5: Quality and Integration
- `15_trace_tests_and_examples.md` で trace、golden、教材サンプルを整備する
- `14_integration_packaging.md` で UI、runtime、samples、tests、README を統合する
- `99_template_to_boilerplate.md` で再利用可能な雛形へ一般化する

## Dependency Rules
- UI と runtime core は分離する
- parser 完了前に evaluator を拡張しない
- 教材機能は core に直接食い込ませず、付加レイヤとして実装する
- WebAPI と device は mock-first で進める
- trace と examples は seed 固定、mock 固定で回帰可能にする

## Exit Criteria
- 1 コマンドでブラウザアプリを起動できる
- 主要な情報Iサンプルが実行できる
- trace on/off と教材向け可視化が利用できる
- README と runbook だけで第三者が試せる

## Risks
- 要求拡大によりコア言語が不安定化する
- Monaco UI の先行実装で runtime 設計が後追いになる
- WebAPI / device の本実装志向が強すぎるとブラウザ安全性を崩す

## Immediate Next Outputs
1. `docs/conformance-matrix.md`
2. `docs/feature-breakdown.md`
3. Monaco ワークベンチ仕様
4. 言語仕様と parser 契約
