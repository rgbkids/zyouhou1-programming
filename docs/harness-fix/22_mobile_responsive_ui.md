# Harness: スマホ対応レスポンシブ UI

## Goal
スマホでも学習可能なように、アプリ全体をレスポンシブ対応してください。Monaco、問題文、出力、AI先生、履歴がスマホでも使えることが条件です。

## Output Files
- `src/styles/responsive.css`
- `src/components/layout/ResponsiveShell.tsx`
- `src/components/layout/MobileTabs.tsx`
- `src/components/layout/BottomSheet.tsx`

## Contracts
1. 360px 幅前後でも基本操作できる
2. エディタ / 出力 / 問題 / AI をモバイルタブ化またはボトムシート化できる
3. 重要ボタンは親指で押しやすいサイズ
4. 横画面時はエディタ優先レイアウトへ切り替える
5. キーボード表示時のビューポート変化に耐える
6. モバイルでの Monaco 操作負荷に配慮し、補助ボタンを用意する
   - インデント
   - 実行
   - 次へ
   - ヒント

## Stage Structure
### Stage 1: Layout Breakpoints
### Stage 2: Mobile-first Navigation
### Stage 3: Editor Assist Controls
### Stage 4: Touch QA

## Validation Checklist
- iPhone幅相当で横スクロールしない
- AI先生が邪魔しすぎない
- 問題→コード→実行→解説の流れがスマホで成立する

## Failure Recovery Rules
- 2カラムが厳しければモバイルは完全1カラムにする
- Monaco が重い場合は簡易モードを持つ
