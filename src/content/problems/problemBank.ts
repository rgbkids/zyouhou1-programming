// Problem bank — seed から生成した改題問題集

import type { Problem } from './problemSchema';

export const PROBLEM_BANK: Problem[] = [
  // ─── 変数・代入 ───
  {
    id: 'p-001', type: 'predict-output', difficulty: 'basic',
    topics: ['variables'], sourceId: 'seed-001',
    title: '変数の値を追う',
    statement: '次のプログラムを実行したとき、最後に出力される値はどれか。',
    code: `x = 5\ny = x\nx = 10\nprint(y)`,
    expectedOutput: '5',
    explanation: '`y = x` の時点で y に 5 が代入される。その後 x を変えても y は変わらない。',
    wrongReasons: ['y と x が同じ変数だと誤解すると 10 と答えてしまう'],
    relatedTopics: ['variables'],
    usesMonaco: false,
  },
  {
    id: 'p-002', type: 'multiple-choice', difficulty: 'basic',
    topics: ['operators'], sourceId: 'seed-002',
    title: '整数除算と剰余',
    statement: '`17 // 5` の結果として正しいものはどれか。',
    choices: [
      { id: 'a', text: '3', isCorrect: true },
      { id: 'b', text: '3.4', isCorrect: false },
      { id: 'c', text: '2', isCorrect: false },
      { id: 'd', text: '5', isCorrect: false },
    ],
    explanation: '`//` は切り捨て除算。17 ÷ 5 = 3 余り 2 なので、答えは 3。',
    wrongReasons: ['`/` との混同', '余りの値と混同'],
    relatedTopics: ['operators'],
    usesMonaco: false,
  },

  // ─── 分岐 ───
  {
    id: 'p-010', type: 'predict-output', difficulty: 'basic',
    topics: ['branch'], sourceId: 'seed-010',
    title: 'if/else の出力',
    statement: '次のプログラムの出力を答えよ。',
    code: `score = 55\nif score >= 60:\n    print("合格")\nelse:\n    print("不合格")`,
    expectedOutput: '不合格',
    explanation: 'score が 55 なので条件 `score >= 60` は False。else ブロックが実行される。',
    relatedTopics: ['branch'],
    usesMonaco: false,
  },
  {
    id: 'p-011', type: 'fill-blank', difficulty: 'standard',
    topics: ['branch'], sourceId: 'seed-011',
    title: '多段分岐の穴埋め',
    statement: '次のプログラムで score=75 のとき "標準" と出力されるよう、___を埋めよ。',
    code: `score = 75\nif score >= 90:\n    print("優秀")\nelif score >= ___:\n    print("標準")\nelse:\n    print("要努力")`,
    blankAnswers: ['70', '60'],
    explanation: 'elif の条件に 70 以上（または 60 以上）を指定すれば score=75 で "標準" になる。',
    relatedTopics: ['branch'],
    usesMonaco: false,
  },

  // ─── ループ ───
  {
    id: 'p-020', type: 'predict-output', difficulty: 'basic',
    topics: ['loop'], sourceId: 'seed-020',
    title: 'for ループの合計',
    statement: '次のプログラムの出力を答えよ。',
    code: `total = 0\nfor i in range(1, 5):\n    total = total + i\nprint(total)`,
    expectedOutput: '10',
    explanation: 'range(1,5) は 1,2,3,4。合計 = 1+2+3+4 = 10。',
    relatedTopics: ['loop'],
    usesMonaco: false,
  },
  {
    id: 'p-021', type: 'fix-code', difficulty: 'standard',
    topics: ['loop'], sourceId: 'seed-021',
    title: 'while ループのバグ修正',
    statement: '次のプログラムは無限ループになる。1行だけ修正して「5 4 3 2 1」と出力されるようにせよ。',
    code: `n = 5\nwhile n > 0:\n    print(n)\n`,
    fixedCode: `n = 5\nwhile n > 0:\n    print(n)\n    n = n - 1`,
    explanation: 'ループ内で n を 1 ずつ減らす処理が抜けている。`n = n - 1` を追加する。',
    relatedTopics: ['loop'],
    usesMonaco: true,
  },

  // ─── リスト ───
  {
    id: 'p-030', type: 'multiple-choice', difficulty: 'standard',
    topics: ['list'], sourceId: 'seed-030',
    title: 'リストのインデックス',
    statement: '`a = [10, 20, 30, 40]` のとき、`a[2]` の値はどれか。',
    choices: [
      { id: 'a', text: '20', isCorrect: false },
      { id: 'b', text: '30', isCorrect: true },
      { id: 'c', text: '40', isCorrect: false },
      { id: 'd', text: '10', isCorrect: false },
    ],
    explanation: 'インデックスは 0 始まり。a[0]=10, a[1]=20, a[2]=30。',
    wrongReasons: ['インデックスを 1 始まりと誤解'],
    relatedTopics: ['list'],
    usesMonaco: false,
  },
  {
    id: 'p-031', type: 'code-reading', difficulty: 'standard',
    topics: ['list', 'loop'], sourceId: 'seed-031',
    title: 'リストとループの組み合わせ',
    statement: '次のプログラムの最終的な出力を答えよ。',
    code: `data = [3, 1, 4, 1, 5]\ntotal = 0\nfor v in data:\n    total = total + v\nprint(total)`,
    expectedOutput: '14',
    explanation: '3+1+4+1+5 = 14。for v in list は各要素を順番に取り出す。',
    relatedTopics: ['list', 'loop'],
    usesMonaco: false,
  },

  // ─── 関数 ───
  {
    id: 'p-040', type: 'predict-output', difficulty: 'standard',
    topics: ['function'], sourceId: 'seed-040',
    title: '関数の戻り値',
    statement: '次のプログラムの出力を答えよ。',
    code: `def double(x):\n    return x * 2\n\nresult = double(7)\nprint(result)`,
    expectedOutput: '14',
    explanation: 'double(7) は 7*2=14 を返す。result に 14 が代入され出力される。',
    relatedTopics: ['function'],
    usesMonaco: false,
  },
  {
    id: 'p-041', type: 'fix-code', difficulty: 'advanced',
    topics: ['function'], sourceId: 'seed-041',
    title: '関数のスコープ修正',
    statement: '次のプログラムは意図通りに動かない。x を関数内で変更するよう修正せよ。',
    code: `def increment():\n    x = x + 1\n\nx = 0\nincrement()\nprint(x)`,
    fixedCode: `def increment(x):\n    return x + 1\n\nx = 0\nx = increment(x)\nprint(x)`,
    explanation: '関数内で外部変数を直接変更することはできない。引数として渡し、戻り値で受け取る。',
    relatedTopics: ['function', 'variables'],
    usesMonaco: true,
  },

  // ─── アルゴリズム（探索） ───
  {
    id: 'p-050', type: 'multiple-choice', difficulty: 'standard',
    topics: ['algorithm-search'], sourceId: 'seed-050',
    title: '線形探索の比較回数',
    statement: '`[5, 3, 8, 1, 9]` を線形探索で 1 を探すとき、最初に見つかるまでの比較回数はいくつか。',
    choices: [
      { id: 'a', text: '3', isCorrect: false },
      { id: 'b', text: '4', isCorrect: true },
      { id: 'c', text: '5', isCorrect: false },
      { id: 'd', text: '1', isCorrect: false },
    ],
    explanation: '先頭から順に比較: 5≠1, 3≠1, 8≠1, 1=1 → 4回目で発見。',
    relatedTopics: ['algorithm-search', 'loop'],
    usesMonaco: false,
  },
  {
    id: 'p-051', type: 'multiple-choice', difficulty: 'advanced',
    topics: ['algorithm-search'], sourceId: 'seed-051',
    title: '二分探索の前提条件',
    statement: '二分探索が正しく動作するための前提条件として正しいものはどれか。',
    choices: [
      { id: 'a', text: 'リストが昇順または降順にソートされている', isCorrect: true },
      { id: 'b', text: 'リストの要素数が偶数である', isCorrect: false },
      { id: 'c', text: '探す値がリストの先頭にある', isCorrect: false },
      { id: 'd', text: 'リストに重複がない', isCorrect: false },
    ],
    explanation: '二分探索は中央値との比較で範囲を半分に絞るため、データがソート済みである必要がある。',
    relatedTopics: ['algorithm-search'],
    usesMonaco: false,
  },

  // ─── 数値誤差 ───
  {
    id: 'p-070', type: 'predict-output', difficulty: 'basic',
    topics: ['numeric-error'], sourceId: 'seed-070',
    title: '浮動小数点誤差',
    statement: '次のプログラムの出力は「0.01」ではない。実際の出力の特徴として正しいものはどれか。',
    code: `print(0.28 - 0.27)`,
    choices: [
      { id: 'a', text: '0.01 より少し大きいか小さい値が出る', isCorrect: true },
      { id: 'b', text: '必ず 0 になる', isCorrect: false },
      { id: 'c', text: 'エラーが発生する', isCorrect: false },
      { id: 'd', text: '整数に丸められる', isCorrect: false },
    ],
    explanation: 'コンピュータは実数を二進数の有限桁で近似するため、0.01 と完全には一致しない微小な誤差が生じる。',
    relatedTopics: ['numeric-error', 'operators'],
    usesMonaco: false,
  },
];

export function getProblemById(id: string): Problem | undefined {
  return PROBLEM_BANK.find(p => p.id === id);
}

export function getProblemsByTopic(topic: string): Problem[] {
  return PROBLEM_BANK.filter(p => p.topics.includes(topic as Problem['topics'][number]));
}

export function getProblemsByDifficulty(difficulty: Problem['difficulty']): Problem[] {
  return PROBLEM_BANK.filter(p => p.difficulty === difficulty);
}
