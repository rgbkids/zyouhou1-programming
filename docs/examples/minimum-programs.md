# info1 最小動作サンプル集

## 1. 順次（Hello World）

```
print("こんにちは")
print("情報I")
```

期待出力:
```
こんにちは
情報I
```

---

## 2. 変数と算術

```
x = 5
y = 3
print(x + y)
print(x * y)
print(x / y)
```

期待出力:
```
8
15
1.6666666666666667
```

---

## 3. 条件分岐

```
score = 75
if score >= 60:
    print("合格")
else:
    print("不合格")
```

期待出力:
```
合格
```

---

## 4. for 反復

```
for i in range(1, 6, 1):
    print(i)
```

期待出力:
```
1
2
3
4
5
```

---

## 5. while 反復

```
n = 3
while n > 0:
    print(n)
    n = n - 1
```

期待出力:
```
3
2
1
```

---

## 6. リスト

```
scores = [80, 90, 70, 85]
print(len(scores))
print(scores[0])
```

期待出力:
```
4
80
```

---

## 7. 関数定義と呼び出し

```
def add(a, b):
    return a + b

result = add(3, 4)
print(result)
```

期待出力:
```
7
```
