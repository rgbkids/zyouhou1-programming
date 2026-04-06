# Harness: AI生成 実力テスト

## Goal
練習問題バンクと学習履歴をベースに、**AI が実力テストを生成する機能** を実装してください。

## Output Files
- `src/features/exam/examGenerator.ts`
- `src/features/exam/AbilityTestSession.tsx`
- `src/features/exam/examSchema.ts`
- `src/features/exam/examRubric.ts`

## Contracts
1. 実力テストは練習問題の延長として構成する
2. topic の偏りを避ける
3. AI 生成時も blueprint を先に作る
   - 出題数
   - topic 配分
   - 難易度分布
   - 問題形式の比率
4. 生成結果は schema validation を通す
5. AI未接続時は static blueprint + 問題バンク抽選で代替する
6. テスト結果は学習履歴へ記録する

## Stage Structure
### Stage 1: Blueprint Generator
### Stage 2: AI-backed Question Drafting
### Stage 3: Validation + Fallback
### Stage 4: Scoring + Feedback

## Validation Checklist
- テストが開始できる
- topic 配分が確認できる
- AI失敗時もテストが作れる
- 結果が履歴へ戻る

## Failure Recovery Rules
- AI品質が不安定なら、AI は blueprint 生成のみに限定し、本文は既存バンクを使う
- 問題の質が低い場合は rubric で弾いて再生成する
