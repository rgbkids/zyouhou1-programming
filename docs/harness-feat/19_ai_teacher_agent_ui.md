# Harness: AI先生エージェント UI と対話機能

## Goal
学習中にその場で質問できる **AI先生キャラクターUI** を実装してください。先生らしい口調と、**喜怒哀楽に相当する簡単なアニメーション** を持たせます。

## Output Files
- `src/features/ai/AITeacherPanel.tsx`
- `src/features/ai/teacherCharacter.tsx`
- `src/features/ai/teacherAnimation.ts`
- `src/features/ai/aiClient.ts`
- `src/features/ai/promptBuilders.ts`

## Contracts
1. 学習画面から即座に開ける
2. 次をコンテキストに渡せる
   - 現在の問題
   - 現在のコード
   - 直近のエラー
   - topic tag
3. キャラクター状態を最低限用意する
   - neutral
   - happy
   - thinking
   - warning
   - sad
4. CSS / SVG / Framer Motion などで軽量に動かす
5. AI が未接続でも、ルールベースFAQで最低限答える
6. 生徒に答えを丸投げしすぎず、段階ヒントを返せる

## Stage Structure
### Stage 1: Chat Shell
### Stage 2: Character State Machine
### Stage 3: AI Adapter + Fallback
### Stage 4: Context-aware Answering

## Validation Checklist
- 現在のコードを添えて質問できる
- キャラの状態が応答種別で変わる
- AI未接続でも壊れない

## Failure Recovery Rules
- アニメーションが重ければ 2D 表情差分に落とす
- AI 応答が失敗したら FAQ / ヒントテンプレへ退避する
