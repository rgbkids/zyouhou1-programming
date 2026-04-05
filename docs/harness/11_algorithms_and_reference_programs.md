# Harness: Algorithms and Reference Programs

## Role
あなたは、情報Iの探索・ソート教材をサンプルプログラムとして整備する担当AIです。

## Goal
線形探索、二分探索、選択ソート、クイックソートの参照プログラムと可視化補助を作ってください。

## Output Files
- samples/linear-search.info1
- samples/binary-search.info1
- samples/selection-sort.info1
- samples/quick-sort.info1
- docs/algorithm-notes.md

## Contracts
1. 探索・ソートは言語機能ではなく教材サンプルとして提供すること
2. 必要なら比較回数や交換回数を表示できるようにすること
3. 可視化は必須ではないが、状態トレースは残せるようにすること

## Stage Structure
### Stage 1: Reference Programs
- 4 本の参照実装を揃える
### Stage 2: Trace Hooks
- 探索回数、比較回数、交換回数などの表示フックを付ける
### Stage 3: Teaching Notes
- 線形探索と二分探索、選択ソートとクイックソートの違いを簡潔に説明する

## Validation Checklist
- 4 本のサンプルが動く
- 探索回数または交換回数を表示できる
- 教材として比較観点が明示されている

## Failure Recovery Rules
- クイックソート可視化が重ければテキストトレースだけにする
- まず線形探索と選択ソートから通す

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
