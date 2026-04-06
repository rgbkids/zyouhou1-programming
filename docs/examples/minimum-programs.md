# Minimum Programs

## Sequential
```info1
print("おはよう")
print("こんにちは")
print("おやすみ")
```

## Variable and Arithmetic
```info1
x = 10
y = 5
print(x + y)
```

## If / Else
```info1
score = 72
if score >= 60:
    print("pass")
else:
    print("fail")
```

## For Range
```info1
total = 0
for i in range(1, 6, 1):
    total = total + i
print(total)
```

## While
```info1
x = 1
while x < 4:
    print(x)
    x = x + 1
```

## List
```info1
nums = [10, 20, 30]
print(nums[0])
print(len(nums))
```

## Function
```info1
def add(a, b):
    return a + b

print(add(3, 4))
```

## Random
```info1
n = random.randrange(6)
print(n)
```

## WebAPI
```info1
result = webapi.get_json("zip", "1000001")
print(result)
```

## Device
```info1
temp = device.temperature()
if temp > 25:
    device.led_show("HOT")
else:
    device.led_show("OK")
```
