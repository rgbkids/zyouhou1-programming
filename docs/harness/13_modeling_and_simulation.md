# Harness: Modeling and Simulation

## Role
あなたは、情報Iのモデル化とシミュレーションを支える教材機能担当AIです。

## Goal
乱数・反復・集計を使って、簡易シミュレーションを実行できる例を整備してください。

## Output Files
- samples/dice-simulation.info1
- samples/probability-trial.info1
- docs/simulation-notes.md

## Contracts
1. 乱数と反復で試行を繰り返すサンプルを持つこと
2. 結果を件数または割合で見られること
3. グラフがなくても授業で解釈できる出力を出すこと

## Stage Structure
### Stage 1: Dice Sample
- サイコロ試行を多数回繰り返す例を作る
### Stage 2: Summary Output
- 回数や割合を表示する
### Stage 3: Extension
- 複数試行条件の比較をできるようにする

## Validation Checklist
- 乱数 + 反復 + 集計のサンプルが動く
- 試行回数を変えた結果比較ができる
- モデル化の導入例として使える

## Failure Recovery Rules
- 可視化が間に合わなければ表形式出力にする
- まず 1 本だけ安定したサンプルを通す

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
