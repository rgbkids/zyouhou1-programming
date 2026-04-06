# Feature Breakdown

## Goal
実装対象を、依存順に沿った作業単位へ分解する。各単位は単独で検証でき、統合時に責務が混ざらないことを前提にする。

## Workstreams
### 1. Scope and Specification
- `docs/conformance-matrix.md` で対象範囲を固定する
- `docs/language-spec.md` と `docs/grammar.ebnf.md` で構文を固定する
- built-in は `print`, `len`, `range`, `random`, `webapi`, `device` に絞る

### 2. Editor Shell
- Monaco を使った最小ワークベンチを作る
- 必要機能はコード編集、実行、停止/リセット、出力、サンプル選択
- evaluator とは `run(code)` 相当の疎結合 API で接続する

### 3. Parser and Evaluator
- tokenizer と parser で AST または安全な中間表現を作る
- evaluator で式、文、スコープ、関数、リストを処理する
- `eval` と `Function` は使わない

### 4. Runtime Services
- stdout バッファを分離実装する
- `random` は seed 固定可能にする
- `webapi` は allowlist または fixture ベースで実装する
- `device` は UI パネルと同期する模擬 API にする

### 5. Education Layer
- 計算誤差の説明パネルと再現サンプルを用意する
- 探索・ソートは参照プログラムとして提供する
- trace は通常出力を壊さず、変数更新や反復回数を補助表示する
- シミュレーションは件数と割合が読める出力を優先する

### 6. Integration and QA
- samples、tests、UI パネル、runtime を 1 つのブラウザアプリに統合する
- Must 項目は最低 1 本ずつ回帰テストに載せる
- README と runbook で第三者が起動できる状態にする

## Dependency Order
1. Scope fix
2. Language spec
3. Monaco shell
4. Tokenizer / parser
5. Evaluator core
6. I/O and control flow
7. Lists / functions / random
8. WebAPI and device mocks
9. Numeric / algorithm / simulation materials
10. Trace, examples, integration

## Acceptance by Phase
- Scope 完了: Must / Should / Optional と担当ハーネスが確定している
- Core 完了: 順次、分岐、反復、リスト、関数が UI 非依存で動く
- Education 完了: 誤差、探索/ソート、模擬API、simulation の教材例が揃う
- Integration 完了: 1 コマンド起動、サンプル実行、README 再現が可能

## Deferred Items
- 実機ハードウェア接続
- 任意ドメインへの通信
- 高度な可視化や複雑な IDE 機能
