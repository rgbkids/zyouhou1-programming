# Harness: 学習履歴に基づく個別アドバイス

## Goal
学習履歴に基づいて、AI先生またはルールベースで**学習者に適したアドバイス**を返す機能を実装してください。

## Output Files
- `src/features/advice/adviceEngine.ts`
- `src/features/advice/adviceSummary.tsx`
- `src/features/advice/historyToAdviceContext.ts`

## Contracts
1. 入力は localStorage 履歴のみ
2. 見るべき指標
   - topic別正答率
   - 最近の誤答
   - ヒント依存度
   - 実行エラー傾向
   - 学習頻度
3. 出力は次を含む
   - 何が苦手か
   - 次に何をやるべきか
   - 復習候補
   - 励ましコメント
4. AI 利用時も元の数値指標を UI で見せる
5. 個人情報やログイン前提にしない

## Stage Structure
### Stage 1: Deterministic Advice Rules
### Stage 2: AI Rephrasing / Coaching
### Stage 3: In-session Recommendations

## Validation Checklist
- topic 弱点から助言が出る
- 根拠の指標が表示される
- AIなしでも最低限の助言が出る
