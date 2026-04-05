// Sample program registry for the Jouhou-I interpreter

export interface Sample {
  id: string;
  label: string;
  category: string;
  code: string;
}

export const SAMPLES: Sample[] = [
  {
    id: 'hello',
    label: 'Hello World',
    category: '基本',
    code: `# Hello World
print("こんにちは、世界！")
print("Hello, World!")
`,
  },
  {
    id: 'sequential',
    label: '順次処理',
    category: '基本',
    code: `# 順次処理の例
x = 10
y = 20
z = x + y
print("x =", x)
print("y =", y)
print("x + y =", z)
`,
  },
  {
    id: 'branch',
    label: '分岐 (if/else)',
    category: '制御',
    code: `# 分岐の例
score = 75
if score >= 60:
    print("合格")
else:
    print("不合格")
`,
  },
  {
    id: 'loop_for',
    label: 'ループ (for)',
    category: '制御',
    code: `# for ループの例
total = 0
for i in range(1, 11):
    total = total + i
print("1から10の合計:", total)
`,
  },
  {
    id: 'loop_while',
    label: 'ループ (while)',
    category: '制御',
    code: `# while ループの例
n = 1
while n <= 5:
    print(n)
    n = n + 1
`,
  },
  {
    id: 'list_basic',
    label: 'リスト操作',
    category: 'データ',
    code: `# リストの基本操作
fruits = ["りんご", "みかん", "バナナ"]
print("リスト:", fruits)
print("要素数:", len(fruits))
print("最初の要素:", fruits[0])
fruits[1] = "ぶどう"
print("変更後:", fruits)
`,
  },
  {
    id: 'function',
    label: '関数定義',
    category: '関数',
    code: `# 関数の定義と呼び出し
def add(a, b):
    return a + b

def greet(name):
    print("こんにちは、" + name + "さん！")

result = add(3, 4)
print("3 + 4 =", result)
greet("太郎")
`,
  },
  {
    id: 'random_basic',
    label: '乱数',
    category: '乱数',
    code: `# 乱数の例
for i in range(5):
    r = random.randrange(6)
    print("サイコロ:", r + 1)
`,
  },
  {
    id: 'linear_search',
    label: '線形探索',
    category: 'アルゴリズム',
    code: `# 線形探索
def linear_search(lst, target):
    for i in range(len(lst)):
        if lst[i] == target:
            return i
    return -1

data = [5, 3, 8, 1, 9, 2, 7]
target = 9
result = linear_search(data, target)
if result >= 0:
    print(target, "は", result, "番目にあります")
else:
    print(target, "は見つかりませんでした")
`,
  },
  {
    id: 'binary_search',
    label: '二分探索',
    category: 'アルゴリズム',
    code: `# 二分探索（ソート済みリストが必要）
def binary_search(lst, target):
    left = 0
    right = len(lst) - 1
    while left <= right:
        mid = (left + right) // 2
        if lst[mid] == target:
            return mid
        elif lst[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

data = [1, 3, 5, 7, 9, 11, 13, 15]
target = 9
result = binary_search(data, target)
if result >= 0:
    print(target, "は", result, "番目にあります")
else:
    print(target, "は見つかりませんでした")
`,
  },
  {
    id: 'selection_sort',
    label: '選択ソート',
    category: 'アルゴリズム',
    code: `# 選択ソート
def selection_sort(lst):
    n = len(lst)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if lst[j] < lst[min_idx]:
                min_idx = j
        tmp = lst[i]
        lst[i] = lst[min_idx]
        lst[min_idx] = tmp
    return lst

data = [5, 3, 8, 1, 9, 2, 7, 4, 6]
print("ソート前:", data)
result = selection_sort(data)
print("ソート後:", result)
`,
  },
  {
    id: 'floating_point_error',
    label: '浮動小数点誤差',
    category: '数値',
    code: `# 浮動小数点誤差の例
a = 0.28
b = 0.27
diff = a - b
print("0.28 - 0.27 =", diff)
print("（正しい答えは 0.01 のはずが…）")

# 整数で計算して回避する方法
int_diff = (28 - 27)
correct = int_diff / 100
print("整数計算で回避:", correct)
`,
  },
  {
    id: 'dice_simulation',
    label: 'サイコロシミュレーション',
    category: 'シミュレーション',
    code: `# サイコロシミュレーション
trials = 600
counts = [0, 0, 0, 0, 0, 0]

for i in range(trials):
    r = random.randrange(6)
    counts[r] = counts[r] + 1

print("サイコロを", trials, "回振った結果:")
for i in range(6):
    print(i + 1, "の目:", counts[i], "回")
`,
  },
  {
    id: 'device_demo',
    label: 'デバイス操作',
    category: 'デバイス',
    code: `# デバイスシミュレーション
x = device.accelerometer_x()
print("加速度 X:", x)

temp = device.temperature()
print("温度:", temp)

device.led_show("Hello")
print("LEDに表示しました")
`,
  },
];
