# Harness: Precision and Numeric Error Demo

## Role
あなたは、計算誤差教材をインタプリタ上で再現する担当AIです。

## Goal
浮動小数点誤差、オーバーフロー相当の説明、整数化による回避例を見せられる教材機能を整備してください。

## Output Files
- samples/floating-point-error.info1
- docs/numeric-error-notes.md
- src/ui/NumericHintPanel.tsx

## Contracts
1. 0.28 - 0.27 のような誤差例を確認できること
2. 整数で計算して後で小数へ戻す回避例を示せること
3. 単に『バグ』でなく内部表現の有限性として説明できること
4. 可能なら Number 表現上の注意を UI で補足すること

## Stage Structure
### Stage 1: Repro Samples
- 小数計算誤差が出るサンプルを用意する
### Stage 2: Safe Alternative
- 整数化してから計算する例を用意する
### Stage 3: Teaching Panel
- なぜ起きるかを短い説明として出せるようにする

## Validation Checklist
- 誤差例が再現できる
- 回避例が併記されている
- 授業で説明しやすい短文解説がある

## Failure Recovery Rules
- エンジン差で表示が微妙に違うなら、誤差の存在確認に目的を絞る
- オーバーフローの完全再現が難しければ説明資料として扱う

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
