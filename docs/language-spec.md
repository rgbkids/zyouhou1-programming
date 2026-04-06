# 情報I インタプリタ 言語仕様

## 概要
Python 風の教育用サブセット言語。インデントでブロックを表現する。

## 基本規則
- 文字コード: UTF-8
- インデント: スペース 4 つ（または 2 つ、先頭の文のインデントに合わせる）
- コメント: `#` から行末まで
- 文の区切り: 改行
- ブロック: `:` の後にインデントレベルを上げる

---

## リテラル

| 種類 | 例 |
|------|----|
| 整数 | `0`, `42`, `-1` |
| 浮動小数点 | `3.14`, `-0.5` |
| 文字列 | `"hello"`, `'world'` |
| 真偽値 | `True`, `False` |
| None | `None` |
| リスト | `[1, 2, 3]`, `[]` |

---

## 演算子

### 算術
`+`, `-`, `*`, `/`（実数除算）, `//`（整数除算）, `%`（剰余）, `**`（べき乗）

### 比較
`==`, `!=`, `<`, `>`, `<=`, `>=`

### 論理
`and`, `or`, `not`

### 単項
`-`（数値否定）, `not`（論理否定）

### 演算子優先順位（高 → 低）
1. `**`
2. 単項 `-`
3. `*`, `/`, `//`, `%`
4. `+`, `-`
5. `<`, `>`, `<=`, `>=`, `==`, `!=`
6. `not`
7. `and`
8. `or`

---

## 文

### 代入
```
x = 1
a = [1, 2, 3]
a[0] = 99
```

### 出力
```
print(x)
print("hello", x, sep=", ")
```

### 条件分岐
```
if x > 0:
    print("正")
elif x == 0:
    print("ゼロ")
else:
    print("負")
```

### for 反復
```
for i in range(5):
    print(i)

for i in range(1, 6):
    print(i)

for i in range(0, 10, 2):
    print(i)
```
`range(stop)` = `range(0, stop, 1)`  
`range(start, stop)` = `range(start, stop, 1)`

### while 反復
```
x = 0
while x < 5:
    x = x + 1
    print(x)
```
無限ループ防止: 最大 10,000 ステップで強制終了

### 関数定義・呼び出し
```
def add(a, b):
    return a + b

result = add(3, 4)
print(result)
```

### break / continue
```
for i in range(10):
    if i == 5:
        break
    if i % 2 == 0:
        continue
    print(i)
```

---

## 組み込み関数

| 関数 | 説明 |
|------|------|
| `print(v, ...)` | 出力（複数引数はスペース区切り） |
| `len(a)` | リストまたは文字列の長さ |
| `range(stop)` | 0 から stop-1 のイテラブル |
| `range(start, stop)` | start から stop-1 |
| `range(start, stop, step)` | start から stop 方向へ step 刻み |
| `int(v)` | 整数変換 |
| `float(v)` | 浮動小数点変換 |
| `str(v)` | 文字列変換 |

---

## 組み込みモジュール

### `random`
```
import random  # または from random import randrange
x = random.randrange(6)        # 0-5 の乱数
x = random.randrange(1, 7)     # 1-6 の乱数
```

### `webapi`（模擬）
```
result = webapi.get_json("zipcode", {"zipcode": "1000001"})
print(result["address1"])
```

### `device`（模擬）
```
x = device.accelerometer_x()
device.led_show("A")
device.led_clear()
t = device.temperature()
```

---

## エラーハンドリング
- 構文エラー: 行・列番号付きメッセージ、実行停止
- 実行時エラー: エラーメッセージを出力パネルに表示、実行停止
- 無限ループ: ステップ上限到達でエラーとして停止
