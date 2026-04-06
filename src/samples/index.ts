export interface Sample {
  id: string;
  label: string;
  category: string;
  code: string;
}

export const SAMPLES: Sample[] = [
  // ─── 基本プログラム ───────────────────────────────────────────────────────
  {
    id: 'hello',
    label: '順次: あいさつ',
    category: '基本',
    code: `# 順次処理の例
print("おはようございます")
print("こんにちは")
print("おやすみなさい")
`,
  },
  {
    id: 'branch',
    label: '分岐: 合否判定',
    category: '基本',
    code: `# if-else による分岐
score = 75
if score >= 60:
    print("合格")
else:
    print("不合格")
`,
  },
  {
    id: 'loop_sum',
    label: '反復: 合計計算',
    category: '基本',
    code: `# for によるループと合計
total = 0
for i in range(1, 6):
    total = total + i
    print(i, "を加算: 合計 =", total)
print("最終合計:", total)
`,
  },
  {
    id: 'while_loop',
    label: '反復: while ループ',
    category: '基本',
    code: `# while による反復
x = 1
while x <= 5:
    print(x)
    x = x + 1
`,
  },
  {
    id: 'odd_print',
    label: '分岐+反復: 奇数表示',
    category: '基本',
    code: `# 分岐と反復の組み合わせ
for i in range(1, 11):
    if i % 2 != 0:
        print(i)
`,
  },

  // ─── 応用プログラム ───────────────────────────────────────────────────────
  {
    id: 'list_sum',
    label: 'リスト: 合計関数',
    category: '応用',
    code: `# リストと関数の例
def sum_list(a):
    total = 0
    for i in range(len(a)):
        total = total + a[i]
    return total

scores = [85, 92, 78, 95, 60]
print("合計:", sum_list(scores))
print("平均:", sum_list(scores) / len(scores))
`,
  },
  {
    id: 'random_branch',
    label: '乱数: さいころ',
    category: '応用',
    code: `import random
# 乱数と分岐
result = random.randrange(1, 7)
print("さいころの目:", result)
if result >= 4:
    print("大きい数が出た！")
else:
    print("小さい数が出た")
`,
  },
  {
    id: 'fibonacci',
    label: '関数: フィボナッチ数列',
    category: '応用',
    code: `# 関数定義と再帰
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

for i in range(0, 10):
    print("fib(" + str(i) + ") =", fib(i))
`,
  },

  // ─── アルゴリズム ─────────────────────────────────────────────────────────
  {
    id: 'linear_search',
    label: '線形探索',
    category: 'アルゴリズム',
    code: `# 線形探索
def linear_search(a, target):
    count = 0
    for i in range(len(a)):
        count = count + 1
        if a[i] == target:
            print("見つかった: インデックス", i, "（比較回数:", count, "）")
            return i
    print("見つからなかった（比較回数:", count, "）")
    return -1

data = [5, 3, 8, 1, 9, 2, 7, 4, 6]
linear_search(data, 9)
linear_search(data, 10)
`,
  },
  {
    id: 'binary_search',
    label: '二分探索',
    category: 'アルゴリズム',
    code: `# 二分探索（ソート済みリストが必要）
def binary_search(a, target):
    left = 0
    right = len(a) - 1
    count = 0
    while left <= right:
        count = count + 1
        mid = (left + right) // 2
        if a[mid] == target:
            print("見つかった: インデックス", mid, "（比較回数:", count, "）")
            return mid
        elif a[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    print("見つからなかった（比較回数:", count, "）")
    return -1

data = [1, 2, 3, 4, 5, 6, 7, 8, 9]
binary_search(data, 7)
binary_search(data, 10)
`,
  },
  {
    id: 'selection_sort',
    label: '選択ソート',
    category: 'アルゴリズム',
    code: `# 選択ソート
def selection_sort(a):
    n = len(a)
    swaps = 0
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j
        if min_idx != i:
            tmp = a[i]
            a[i] = a[min_idx]
            a[min_idx] = tmp
            swaps = swaps + 1
    return swaps

data = [64, 25, 12, 22, 11]
print("ソート前:", data)
swaps = selection_sort(data)
print("ソート後:", data)
print("交換回数:", swaps)
`,
  },
  {
    id: 'quick_sort',
    label: 'クイックソート',
    category: 'アルゴリズム',
    code: `# クイックソート
def quick_sort(a, low, high):
    if low < high:
        pivot = a[high]
        i = low - 1
        for j in range(low, high):
            if a[j] <= pivot:
                i = i + 1
                tmp = a[i]
                a[i] = a[j]
                a[j] = tmp
        tmp = a[i + 1]
        a[i + 1] = a[high]
        a[high] = tmp
        pi = i + 1
        quick_sort(a, low, pi - 1)
        quick_sort(a, pi + 1, high)

data = [64, 25, 12, 22, 11]
print("ソート前:", data)
quick_sort(data, 0, len(data) - 1)
print("ソート後:", data)
`,
  },

  // ─── 教材: 誤差・シミュレーション ────────────────────────────────────────
  {
    id: 'float_error',
    label: '浮動小数点誤差',
    category: '教材',
    code: `# 浮動小数点誤差の例
a = 0.28
b = 0.27
print("0.28 - 0.27 =", a - b)
print("期待値 0.01 と一致?", a - b == 0.01)

# 回避策: 整数で計算してから変換
a_int = 28
b_int = 27
print("整数で計算:", (a_int - b_int) / 100)
print("一致?", (a_int - b_int) / 100 == 0.01)
`,
  },
  {
    id: 'dice_simulation',
    label: 'シミュレーション: さいころ',
    category: '教材',
    code: `import random
# モンテカルロ的シミュレーション: さいころ 1000 回
trials = 1000
counts = [0, 0, 0, 0, 0, 0]  # 1〜6 の出現回数

for i in range(trials):
    d = random.randrange(1, 7)
    counts[d - 1] = counts[d - 1] + 1

print("さいころ", trials, "回の結果:")
for i in range(6):
    ratio = counts[i] / trials
    bar = ""
    for j in range(int(ratio * 50)):
        bar = bar + "#"
    print(i + 1, ":", counts[i], "回", "(" + str(int(ratio * 100)) + "%)", bar)
`,
  },
  {
    id: 'device_demo',
    label: 'デバイス: センサ制御',
    category: '教材',
    code: `# デバイス模擬: 加速度センサに応じてLEDを制御
x = device.accelerometer_x()
print("加速度X:", x)

if x > 200:
    device.led_show("R")
    print("右に傾いています")
elif x < -200:
    device.led_show("L")
    print("左に傾いています")
else:
    device.led_show("O")
    print("ほぼ水平です")

t = device.temperature()
print("温度:", t, "℃")
`,
  },
];

export function getSampleById(id: string): Sample | undefined {
  return SAMPLES.find(s => s.id === id);
}

export const SAMPLE_CATEGORIES = [...new Set(SAMPLES.map(s => s.category))];
