# Harness: Template to Boilerplate Conversion

## Role
あなたは、個別テンプレートを再利用可能な共通基盤へ一般化するリファクタ担当AIです。

## Goal
下位テンプレートで作った一回限りの実装を、再利用可能なボイラープレートへ変換してください。

## Output Files
- docs/boilerplate-plan.md
- src/core/*
- src/modules/*

## Contracts
1. 一回限りの実装と再利用可能な実装を分けること
2. 可変部分は設定・型・登録機構に寄せること
3. コア評価器はサンプルや教材固有文言から切り離すこと
4. サンプル群は registry 化すること

## Stage Structure
### Stage 1: Identify Fixed vs Variable
- 固定ロジックと教材固有データを分離する
### Stage 2: Extract Registry
- builtins, samples, panels, diagnostics を登録式へ寄せる
### Stage 3: Stabilize Reuse
- 別教材や別UIでも再利用できる形へ整理する

## Validation Checklist
- サンプル差し替えが容易
- UI を差し替えても runtime を再利用できる
- 個別教材の追加でコアが汚れない

## Failure Recovery Rules
- 抽象化しすぎて読みにくくなったら 1 段戻す
- まず登録方式だけ共通化し、完全 plugin 化は後回しにする

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
