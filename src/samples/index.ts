// Sample program registry for info1 Browser Interpreter

export interface SampleEntry {
  id: string;
  label: string;
  category: string;
  code: string;
}

export const SAMPLES: SampleEntry[] = [
  // ── 基本 ────────────────────────────────────────────────────────────
  {
    id: "hello",
    label: "こんにちは（順次）",
    category: "基本",
    code: `# 順次: 上から下へ実行
print("おはようございます")
print("こんにちは")
print("おやすみなさい")
`,
  },
  {
    id: "variables",
    label: "変数と算術",
    category: "基本",
    code: `# 変数と算術演算
x = 10
y = 3
print("和:", x + y)
print("差:", x - y)
print("積:", x * y)
print("商:", x / y)
print("整数商:", x // y)
print("余り:", x % y)
print("べき乗:", x ** y)
`,
  },
  {
    id: "branch",
    label: "条件分岐",
    category: "基本",
    code: `# 条件分岐: 合格・不合格判定
score = 75
if score >= 90:
    print("優秀")
elif score >= 60:
    print("合格")
else:
    print("不合格")
`,
  },
  {
    id: "for-loop",
    label: "for 反復",
    category: "基本",
    code: `# for 反復: 1〜5 の合計
total = 0
for i in range(1, 6, 1):
    total = total + i
    print("i =", i, " 合計 =", total)
print("最終合計:", total)
`,
  },
  {
    id: "while-loop",
    label: "while 反復",
    category: "基本",
    code: `# while 反復: カウントダウン
n = 5
while n > 0:
    print(n)
    n = n - 1
print("発射！")
`,
  },
  // ── 応用 ────────────────────────────────────────────────────────────
  {
    id: "list-sum",
    label: "リストの合計",
    category: "応用",
    code: `# リスト: 点数の合計と平均
scores = [80, 90, 70, 85, 95]
total = 0
for i in range(0, len(scores), 1):
    total = total + scores[i]
average = total / len(scores)
print("合計:", total)
print("平均:", average)
`,
  },
  {
    id: "random-demo",
    label: "乱数（サイコロ）",
    category: "応用",
    code: `# 乱数: サイコロを10回振る
count_six = 0
for i in range(0, 10, 1):
    dice = random.randrange(1, 7)
    print("第", i + 1, "投:", dice)
    if dice == 6:
        count_six = count_six + 1
print("6の目が出た回数:", count_six)
`,
  },
  {
    id: "function-demo",
    label: "関数の定義と呼び出し",
    category: "応用",
    code: `# 関数: リストの合計を返す
def list_sum(lst):
    total = 0
    for i in range(0, len(lst), 1):
        total = total + lst[i]
    return total

scores = [80, 90, 70, 85]
print("合計:", list_sum(scores))
print("平均:", list_sum(scores) / len(scores))
`,
  },
  // ── アルゴリズム ───────────────────────────────────────────────────
  {
    id: "linear-search",
    label: "線形探索",
    category: "アルゴリズム",
    code: `# 線形探索: リストから目標を探す
def linear_search(lst, target):
    count = 0
    for i in range(0, len(lst), 1):
        count = count + 1
        if lst[i] == target:
            print("見つかりました！ インデックス:", i, " 比較回数:", count)
            return i
    print("見つかりませんでした。比較回数:", count)
    return -1

data = [5, 3, 8, 1, 9, 2, 7, 4, 6]
linear_search(data, 9)
linear_search(data, 99)
`,
  },
  {
    id: "binary-search",
    label: "二分探索",
    category: "アルゴリズム",
    code: `# 二分探索: ソート済みリストから探す
def binary_search(lst, target):
    left = 0
    right = len(lst) - 1
    count = 0
    while left <= right:
        count = count + 1
        mid = (left + right) // 2
        print("  確認: インデックス", mid, "の値", lst[mid])
        if lst[mid] == target:
            print("見つかりました！ インデックス:", mid, " 比較回数:", count)
            return mid
        elif lst[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    print("見つかりませんでした。比較回数:", count)
    return -1

data = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
binary_search(data, 13)
`,
  },
  {
    id: "selection-sort",
    label: "選択ソート",
    category: "アルゴリズム",
    code: `# 選択ソート
def selection_sort(lst):
    n = len(lst)
    swaps = 0
    for i in range(0, n - 1, 1):
        min_idx = i
        for j in range(i + 1, n, 1):
            if lst[j] < lst[min_idx]:
                min_idx = j
        if min_idx != i:
            tmp = lst[i]
            lst[i] = lst[min_idx]
            lst[min_idx] = tmp
            swaps = swaps + 1
    print("交換回数:", swaps)
    return lst

data = [5, 3, 8, 1, 9, 2, 7, 4, 6]
print("ソート前:", data)
result = selection_sort(data)
print("ソート後:", result)
`,
  },
  {
    id: "quick-sort",
    label: "クイックソート",
    category: "アルゴリズム",
    code: `# クイックソート（再帰）
def quick_sort(lst, left, right):
    if left >= right:
        return
    pivot = lst[(left + right) // 2]
    i = left
    j = right
    while i <= j:
        while lst[i] < pivot:
            i = i + 1
        while lst[j] > pivot:
            j = j - 1
        if i <= j:
            tmp = lst[i]
            lst[i] = lst[j]
            lst[j] = tmp
            i = i + 1
            j = j - 1
    quick_sort(lst, left, j)
    quick_sort(lst, i, right)

data = [5, 3, 8, 1, 9, 2, 7, 4, 6]
print("ソート前:", data)
quick_sort(data, 0, len(data) - 1)
print("ソート後:", data)
`,
  },
  // ── 計算誤差 ───────────────────────────────────────────────────────
  {
    id: "floating-point-error",
    label: "浮動小数点誤差",
    category: "計算誤差",
    code: `# 浮動小数点誤差のデモ
print("=== 誤差が出る例 ===")
a = 0.28
b = 0.27
result = a - b
print("0.28 - 0.27 =", result)
print("期待値: 0.01 → 実際:", result)

print("")
print("=== 整数化による回避 ===")
# 100倍して整数で計算し、最後に100で割る
a2 = 28
b2 = 27
result2 = (a2 - b2) / 100
print("(28 - 27) / 100 =", result2)
`,
  },
  // ── シミュレーション ────────────────────────────────────────────────
  {
    id: "dice-simulation",
    label: "サイコロシミュレーション",
    category: "シミュレーション",
    code: `# モデル化とシミュレーション: サイコロ
# 各目の出現頻度を調べる
n = 600  # 試行回数
counts = [0, 0, 0, 0, 0, 0]  # 1〜6の出現回数

for i in range(0, n, 1):
    dice = random.randrange(1, 7)
    counts[dice - 1] = counts[dice - 1] + 1

print("試行回数:", n)
print("目  | 回数  | 割合")
print("----+-------+------")
for i in range(0, 6, 1):
    ratio = counts[i] / n
    print(i + 1, "   |", counts[i], "    |", int(ratio * 100), "%")
`,
  },
  {
    id: "probability-trial",
    label: "確率試行（コイン）",
    category: "シミュレーション",
    code: `# コイン投げの確率試行
def coin_trial(n):
    heads = 0
    for i in range(0, n, 1):
        result = random.randrange(0, 2)
        if result == 0:
            heads = heads + 1
    return heads

print("試行回数 | 表の回数 | 表の割合")
print("---------+---------+---------")
for n in [10, 100, 1000]:
    h = coin_trial(n)
    ratio = int(h / n * 100)
    print(n, "      |", h, "     |", ratio, "%")
`,
  },
  // ── デバイス ───────────────────────────────────────────────────────
  {
    id: "device-demo",
    label: "デバイスシミュレータ",
    category: "デバイス",
    code: `# デバイスシミュレータ: センサとLED
# スライダーで加速度や温度を変えて実行してみよう

x = device.accelerometer_x()
t = device.temperature()
print("加速度X:", x)
print("温度:", t, "°C")

if x > 500:
    device.led_show("RIGHT")
    print("→ 右に傾いています")
elif x < -500:
    device.led_show("LEFT")
    print("← 左に傾いています")
else:
    device.led_show("OK")
    print("水平に近い状態です")

if t > 30:
    print("暑い！", t, "°C")
elif t < 10:
    print("寒い！", t, "°C")
else:
    print("快適:", t, "°C")
`,
  },
];
