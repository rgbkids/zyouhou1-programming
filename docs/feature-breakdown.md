# 情報I 機能分解表

## 言語機能（コア実装）

### 式 (Expressions)
- リテラル: 整数、浮動小数点、文字列、真偽値 (`True`/`False`)、`None`
- 変数参照
- 二項演算: `+`, `-`, `*`, `/`, `//`, `%`, `**`
- 比較: `==`, `!=`, `<`, `>`, `<=`, `>=`
- 論理: `and`, `or`, `not`
- 単項: `-`（数値否定）
- リストリテラル: `[1, 2, 3]`
- 添字アクセス: `a[0]`
- 関数呼び出し: `f(x, y)`
- メソッド風呼び出し: `random.randrange(n)`（built-in module として実装）

### 文 (Statements)
- 代入: `x = expr`
- 複合代入: `x += expr`, `x -= expr`（任意）
- `print(expr, ...)`
- `if expr:` / `elif expr:` / `else:`
- `for var in range(start, stop, step):`
- `while expr:`
- `def name(params):` / `return expr`
- `break`, `continue`（任意）

### スコープ規則
- グローバルスコープ（トップレベル）
- 関数ローカルスコープ
- ネスト関数は対象外

---

## 教材UI

| 機能 | コンポーネント | 説明 |
|------|--------------|------|
| コードエディタ | `MonacoWorkbench` | monaco-editor 採用 |
| 出力パネル | `OutputPanel` / `ConsolePanel` | print 結果、エラーを別表示 |
| ツールバー | `Toolbar` | Run / Reset / サンプル選択 |
| デバイス模擬 | `DevicePanel` | センサ値変更、LED 表示 |
| 浮動小数点ヒント | `NumericHintPanel` | 誤差説明補足 |

---

## 模擬API 仕様

### `random` モジュール
```
random.randrange(stop)           → 0 以上 stop 未満の整数
random.randrange(start, stop)    → start 以上 stop 未満の整数
```
seed 注入インタフェース（テスト用）: `runtime.setSeed(42)`

### `webapi` モジュール
```
webapi.get_json(name, params)    → JSON オブジェクト（allowlist のみ）
```
allowlist: `{ "zipcode": "zipcloud.ibsnet.co.jp/api/search?zipcode={zipcode}" }` 等

### `device` モジュール
```
device.accelerometer_x()        → -1024 ～ 1024 の模擬値
device.temperature()            → 模擬温度（℃）
device.light_level()            → 模擬照度（0-255）
device.led_show(text)           → UI の LED パネルに表示
device.led_clear()              → LED パネルをクリア
```

### 組み込み関数
```
print(value, ...)    → 出力バッファに追記
len(list)            → リスト長
range(stop)
range(start, stop)
range(start, stop, step)
int(value)           → 整数変換
float(value)         → 浮動小数点変換
str(value)           → 文字列変換
```

---

## 実装優先順位

### Must（最初に実装）
1. 変数・代入・算術・比較
2. `print()`
3. `if`/`else`
4. `for range` / `while`
5. リスト・添字・`len`
6. 関数定義・呼び出し・`return`
7. 乱数 `random.randrange`

### Should（コア完成後）
- WebAPI allowlist
- デバイス模擬
- アルゴリズムサンプル
- 浮動小数点誤差教材

### Optional
- `input()` mock
- `break` / `continue`
- `elif`（`if`/`else` ネストで代替可）
- アルゴリズム可視化 UI
