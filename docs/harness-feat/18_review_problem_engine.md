# Harness: 復習問題エンジン

## Goal
学習履歴を元に、**過去に間違えた問題をもう一度出題する復習機能** を実装してください。

## Output Files
- `src/features/review/reviewSelector.ts`
- `src/features/review/ReviewSession.tsx`
- `src/features/review/spacedReview.ts`

## Contracts
1. 間違えた問題を優先する
2. 最近間違えたものと、長く放置した弱点を両方拾う
3. 完全同一問題と類題の両方を出せる
4. 復習理由ラベルを表示する
   - 最近間違えた
   - topic の正答率が低い
   - 長期間未復習
5. ログインなし・DBなしで動く

## Stage Structure
### Stage 1: Wrong Answer Queue
### Stage 2: Topic Weakness Review
### Stage 3: Mixed Review Session

## Validation Checklist
- 間違えた問題が復習リストへ入る
- topic 弱点が反映される
- 完全同一と類題を切り替えられる

## Failure Recovery Rules
- データ不足時は topic 同一の類題で補う
- 履歴が空なら通常練習へフォールバックする
