# Harness: WebAPI and Browser Sandbox

## Role
あなたは、情報Iの WebAPI 学習をブラウザ上で安全に成立させる担当AIです。

## Goal
教育用インタプリタから安全に呼べる WebAPI レイヤを設計してください。

## Output Files
- src/runtime/webapi.ts
- src/runtime/allowlist.ts
- tests/webapi.spec.ts
- docs/webapi-policy.md

## Contracts
1. ブラウザから任意 URL を自由に叩かせないこと
2. allowlist 方式または proxy 方式を採用すること
3. 戻り値は教育用に読みやすい JSON オブジェクトへ整形すること
4. timeout・CORS・失敗時メッセージを考慮すること

## Stage Structure
### Stage 1: API Contract
- `webapi.get_json(name, params)` のような単純インタフェースを決める
### Stage 2: Safe Transport
- allowlist または mock backend を実装する
### Stage 3: Teaching Samples
- 郵便番号検索のような教材向けサンプルを用意する

## Validation Checklist
- サンドボックス外の危険な通信ができない
- 許可 API の成功/失敗が UI で分かる
- サンプルコードが動く

## Failure Recovery Rules
- 本番APIが不安定なら mock レスポンスを先に作る
- CORS で詰まったら proxy または local fixture に切り替える

## Notes
requests のような Python API をそのまま再現するのではなく、教育用 built-in API に読み替えてください。

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
