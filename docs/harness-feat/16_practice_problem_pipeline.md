# Harness: 練習問題パイプライン（過去問ベース）

## Goal
**実際の過去問をベース** に、学習用の練習問題を作成する仕組みを実装してください。ここでの「ベース」とは、**論点抽出・改題・難易度調整・類題化** を含みます。

## Output Files
- `src/content/problems/problemBank.ts`
- `src/content/problems/problemSchema.ts`
- `src/content/problems/pastExamSeeds.ts`
- `src/features/practice/PracticeSession.tsx`
- `src/features/practice/problemRenderer.tsx`

## Contracts
1. 問題は topic tag を持つ
2. 問題は次の形式を最低限含む
   - 選択式
   - 穴埋め
   - コード読解
   - コード実行結果予測
   - 修正問題
3. `pastExamSeeds` には出典メタデータを持たせる
   - year
   - sourceKind
   - topic
   - rewritePolicy
4. 過去問の原文長文転載は避け、改題ベースにする
5. 解説・誤答理由・関連 topic を持たせる
6. Monaco 上で解く問題と、通常UIで解く問題の両方を持つ

## Stage Structure
### Stage 1: Schema
- 問題 JSON / TS schema を定義する

### Stage 2: Seed Authoring
- 過去問の論点を抽出し seed 化する
- 改題ルールを文書化する

### Stage 3: Practice UX
- 1問表示
- 回答
- 正誤と解説
- 次へ進む

### Stage 4: Difficulty Layers
- 基礎 / 標準 / 応用
- topic ごとの出題比率制御

## Validation Checklist
- seed から複数問題を作れる
- 問題に出典メタデータがある
- 解説が表示される
- コード問題は Monaco 連携できる

## Failure Recovery Rules
- 問題量が不足したら seed を増やし、1 seed = 複数改題パターンにする
- 著作権リスクがある場合は、問いの構造だけ残して内容を全面改題する

## Final Output Format
1. 問題 schema
2. seed 設計
3. 問題形式一覧
4. 運用時の注意点
