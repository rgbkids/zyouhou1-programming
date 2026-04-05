export type SampleDefinition = {
  id: string;
  title: string;
  category: "basic" | "applied" | "algorithm" | "numeric" | "device" | "simulation";
  code: string;
  note: string;
};

export const samples: SampleDefinition[] = [
  {
    id: "basic-control-flow",
    title: "Basic Control Flow",
    category: "basic",
    note: "順次・分岐・反復の最小例",
    code: `total = 0
for i in range(1, 6, 1):
    total = total + i
if total >= 15:
    print("pass")
else:
    print("fail")
print(total)`,
  },
  {
    id: "applied-programs",
    title: "Lists and Functions",
    category: "applied",
    note: "リスト、len、関数をまとめて確認",
    code: `nums = [3, 5, 8]
def total(items):
    return items[0] + items[1] + items[2]
print(len(nums))
print(total(nums))`,
  },
  {
    id: "floating-point-error",
    title: "Floating Point Error",
    category: "numeric",
    note: "誤差例と整数化の回避例",
    code: `a = 0.28 - 0.27
print(a)
yen = 28 - 27
print(yen / 100)`,
  },
  {
    id: "device-demo",
    title: "Device Demo",
    category: "device",
    note: "模擬 device API で計測・制御を確認",
    code: `temp = device.temperature()
if temp > 25:
    device.led_show("HOT")
else:
    device.led_show("OK")
print(temp)`,
  },
  {
    id: "linear-search",
    title: "Linear Search",
    category: "algorithm",
    note: "線形探索の教材例",
    code: `items = [4, 8, 15, 16]
target = 15
index = -1
for i in range(0, 4, 1):
    if items[i] == target:
        index = i
print(index)`,
  },
  {
    id: "binary-search",
    title: "Binary Search",
    category: "algorithm",
    note: "二分探索の参照プログラム",
    code: `items = [3, 6, 9, 12, 15, 18, 21]
left = 0
right = 6
mid = 3
if items[mid] < 15:
    left = mid + 1
mid = 5
if items[mid] > 15:
    right = mid - 1
mid = 4
print(mid)`,
  },
  {
    id: "selection-sort",
    title: "Selection Sort",
    category: "algorithm",
    note: "選択ソートは trace と組み合わせて使う",
    code: `nums = [7, 3, 5]
print(nums[0])
print(nums[1])
print(nums[2])`,
  },
  {
    id: "quick-sort",
    title: "Quick Sort Note",
    category: "algorithm",
    note: "クイックソートは参照資料中心で扱う",
    code: `print("quick sort is documented in notes")`,
  },
  {
    id: "dice-simulation",
    title: "Dice Simulation",
    category: "simulation",
    note: "乱数・反復・集計の最小例",
    code: `count = 0
for i in range(0, 10, 1):
    n = random.randrange(6)
    if n == 0:
        count = count + 1
print(count)`,
  },
  {
    id: "webapi-zip",
    title: "WebAPI Zip",
    category: "applied",
    note: "allowlist 経由の WebAPI 例",
    code: `result = webapi.get_json("zip", "1000001")
print(result)`,
  },
];

export const defaultSample = samples[0];
