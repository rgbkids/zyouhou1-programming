# 機能分解表（Feature Breakdown）

下位テンプレートごとの担当範囲と依存関係を示します。

## 依存関係

```
01 (scope) → 03 (lang-spec) → 04 (tokenizer/parser) → 05 (evaluator)
                                                         ↓
                                               06 (I/O) → 07 (control-flow) → 08 (lists/random/func)
                                                                                    ↓
                                                               09 (webapi) + 10 (device) + 12 (precision)
                                                                                    ↓
                                                                        11 (algorithms) + 13 (simulation)
                                                                                    ↓
                                                                     15 (tests) → 14 (integration)
02 (monaco-workbench) ─────────────────────────────────────────────────────────────↗
```

## テンプレート別担当範囲

### 01: scope_and_conformance_matrix
- 情報Iの要求範囲を確定する
- 出力: `docs/conformance-matrix.md`, `docs/feature-breakdown.md`
- 依存: なし

### 02: monaco_editor_workbench
- Monaco エディタUI・出力パネル・ツールバー
- 出力: `src/ui/MonacoWorkbench.tsx`, `src/ui/OutputPanel.tsx`, `src/ui/Toolbar.tsx`, `src/styles/editor.css`
- 依存: 05 (run(code) インタフェース)

### 03: language_subset_and_syntax
- 教育用言語のシンタックス仕様を確定
- 出力: `docs/language-spec.md`, `docs/grammar.ebnf.md`, `docs/examples/minimum-programs.md`
- 依存: 01

### 04: tokenizer_and_parser
- コード文字列 → AST
- 出力: `src/lang/ast.ts`, `src/lang/tokenizer.ts`, `src/lang/parser.ts`, `tests/parser.spec.ts`
- 依存: 03

### 05: runtime_and_evaluator
- AST → 実行 (式/文/スコープ/関数)
- 出力: `src/runtime/value.ts`, `src/runtime/environment.ts`, `src/runtime/evaluator.ts`, `tests/evaluator.spec.ts`
- 依存: 04

### 06: io_and_stdout
- print出力バッファ・エラーチャンネル
- 出力: `src/runtime/io.ts`, `src/ui/ConsolePanel.tsx`, `tests/io.spec.ts`
- 依存: 05

### 07: control_flow
- if/else/elif, for-range, while, break, continue の制御フロー
- 出力: `src/runtime/control-flow.ts`, `tests/control-flow.spec.ts`, `samples/basic-control-flow.info1`
- 依存: 05, 06

### 08: lists_random_functions
- list literal/index, random.randrange, def/return
- 出力: `src/runtime/builtins.ts`, `tests/lists-random-functions.spec.ts`, `samples/applied-programs.info1`
- 依存: 07

### 09: webapi_and_browser_sandbox
- allowlist 方式の安全な WebAPI 呼び出し
- 出力: `src/runtime/webapi.ts`, `src/runtime/allowlist.ts`, `tests/webapi.spec.ts`, `docs/webapi-policy.md`
- 依存: 08

### 10: device_simulation
- センサ・アクチュエータ模擬レイヤ
- 出力: `src/runtime/device.ts`, `src/ui/DevicePanel.tsx`, `tests/device.spec.ts`, `samples/device-demo.info1`
- 依存: 08

### 11: algorithms_and_reference_programs
- 線形探索・二分探索・選択ソート・クイックソートのサンプル
- 出力: 4本の `.info1` サンプル + `docs/algorithm-notes.md`
- 依存: 08

### 12: precision_and_numeric_errors
- 浮動小数点誤差デモ・回避例・説明パネル
- 出力: `samples/floating-point-error.info1`, `docs/numeric-error-notes.md`, `src/ui/NumericHintPanel.tsx`
- 依存: 08

### 13: modeling_and_simulation
- 乱数+反復によるシミュレーション教材
- 出力: `samples/dice-simulation.info1`, `samples/probability-trial.info1`, `docs/simulation-notes.md`
- 依存: 08

### 14: integration_packaging
- 全コンポーネントを1アプリへ統合
- 出力: `src/App.tsx`, `src/samples/index.ts`, `docs/runbook.md`, `tests/integration.spec.ts`, `README.md`
- 依存: 02, 05〜13, 15

### 15: trace_tests_and_examples
- 授業例の自動テスト化・期待出力の golden 化
- 出力: `tests/examples.spec.ts`, `docs/test-matrix.md`, `samples/index.md`
- 依存: 04〜13

### 99: template_to_boilerplate
- 再利用可能な汎用基盤への一般化 (v2以降)
- 出力: `docs/boilerplate-plan.md`, `src/core/`, `src/modules/`
- 依存: 14

## 実装優先順位（Must 機能）

1. 04 tokenizer/parser（コア基盤）
2. 05 evaluator（変数・式・制御フロー）
3. 06 I/O
4. 07 control-flow
5. 08 lists/random/functions
6. 02 monaco-workbench（UI）
7. 03 language-spec（ドキュメント）
8. 11 algorithms（教材サンプル）
9. 12 precision（教材サンプル）
10. 13 simulation（教材サンプル）
11. 09 webapi, 10 device（拡張機能）
12. 15 tests + 14 integration
