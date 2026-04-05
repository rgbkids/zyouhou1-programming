# WebAPI ポリシー

info1 インタプリタでは、セキュリティのため任意の URL への HTTP リクエストを禁止し、
**allowlist（許可リスト）方式**のみを採用します。

## 基本方針

| ルール | 内容 |
|--------|------|
| allowlist 外への通信 | 禁止 |
| allowlist 登録 API | `src/runtime/allowlist.ts` で管理 |
| タイムアウト | 5000ms（fetch 失敗時はモックレスポンスを返す） |
| CORS エラー | モックレスポンスへフォールバック |

## 利用可能な API

| 名前 | 説明 | 呼び出し例 |
|------|------|-----------|
| `zipcode` | 郵便番号 → 住所変換 | `webapi.get_json("zipcode", {"code": "1000001"})` |
| `weather_mock` | 天気情報（モック固定） | `webapi.get_json("weather_mock", {})` |

## 呼び出し方法

```
data = webapi.get_json("zipcode", {"code": "1000001"})
```

- 第1引数: API 名（文字列）
- 第2引数: パラメータ（`{}` または `{"key": "value"}`）
- 戻り値: JSON をパースした値（文字列・数値・リスト・オブジェクト）

## 新しい API の追加方法

`src/runtime/allowlist.ts` の `API_ALLOWLIST` 配列に `ApiEndpoint` を追加します。

```typescript
{
  name: "my_api",
  description: "説明",
  url: (params) => `https://example.com/api?q=${params.query}`,
  mockResponse: { result: "mock" },
}
```

## 安全性の根拠

- ブラウザ上で任意 URL を fetch させると、CSRF やデータ漏洩のリスクがある
- 教育用途では allowlist の範囲で十分な学習体験が得られる
- ネットワーク障害時もモックで授業を継続できる
