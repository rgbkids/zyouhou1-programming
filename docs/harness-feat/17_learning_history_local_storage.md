# Harness: 学習履歴（ログインなし・DBなし）

## Goal
ログインなし・DBなしで、**学習履歴と進捗** が分かる機能を実装してください。永続化は `localStorage` のみを使用します。

## Output Files
- `src/features/history/historyStore.ts`
- `src/features/history/historySchema.ts`
- `src/features/history/ProgressDashboard.tsx`
- `src/features/history/localStorageRepo.ts`

## Contracts
1. ログインしなくても使える
2. サーバDB、IndexedDB、外部同期を使わない
3. 保存する最小単位
   - 解いた問題 id
   - topic tag
   - 正誤
   - 解答時刻
   - 所要時間
   - ヒント利用有無
4. 集計できる項目
   - 総問題数
   - topic別正答率
   - 連続学習日数（簡易）
   - 最近の間違い
5. localStorage 容量を意識し、イベントログと集約統計を分ける

## Stage Structure
### Stage 1: Schema
- `historyEvents`
- `problemStats`
- `topicStats`

### Stage 2: Dashboard
- 正答率
- topic 別ヒートマップ
- 最近学習した単元

### Stage 3: Safe Persistence
- versioning
- migration
- reset/export/import

## Validation Checklist
- リロード後も進捗が残る
- topic 別集計が見える
- データが壊れても初期化回復できる

## Failure Recovery Rules
- localStorage 破損時はバックアップキーから復元する
- データ量が増えすぎたら古いイベントを圧縮し統計へ畳み込む
