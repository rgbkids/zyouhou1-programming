// Prompt builders for the AI teacher

export interface TeacherContext {
  currentCode?: string;
  currentProblem?: string;
  lastError?: string;
  topicTag?: string;
  userQuestion: string;
}

export function buildTeacherPrompt(ctx: TeacherContext): string {
  const parts: string[] = [
    '你は「情報I」を教える高校の先生です。生徒に寄り添い、答えを直接教えるのではなく、段階的なヒントで考えさせてください。',
    '口調は丁寧で親しみやすく、励ましを忘れずに。回答は3〜5文程度で簡潔に。',
  ];

  if (ctx.topicTag) parts.push(`\n現在のトピック: ${ctx.topicTag}`);
  if (ctx.currentProblem) parts.push(`\n問題文: ${ctx.currentProblem}`);
  if (ctx.currentCode) parts.push(`\n生徒のコード:\n\`\`\`\n${ctx.currentCode}\n\`\`\``);
  if (ctx.lastError) parts.push(`\nエラー内容: ${ctx.lastError}`);
  parts.push(`\n生徒の質問: ${ctx.userQuestion}`);

  return parts.join('\n');
}

// Rule-based FAQ fallback (no AI needed)
const FAQ: { keywords: string[]; answer: string }[] = [
  { keywords: ['インデント', 'indent'], answer: 'Pythonではインデント（字下げ）がブロックを表します。if/for/whileの下は必ず4スペース字下げしてください。' },
  { keywords: ['range', 'ループ回数'], answer: 'range(n) は 0 から n-1 までの数を生成します。range(1, n+1) にすると 1 から n になります。' },
  { keywords: ['インデックス', '0始まり', 'リスト'], answer: 'リストのインデックスは0から始まります。最初の要素は a[0]、2番目は a[1] です。' },
  { keywords: ['関数', 'def', 'return'], answer: 'def で関数を定義し、return で値を返します。return がない場合は None が返ります。' },
  { keywords: ['while', '無限ループ'], answer: 'while ループは条件が True の間繰り返します。ループ内で条件を変化させないと無限ループになります。' },
  { keywords: ['エラー', 'NameError'], answer: '変数を使う前に代入が必要です。スペルミスや大文字小文字も確認してください。' },
  { keywords: ['浮動小数点', '0.1', '誤差'], answer: 'コンピュータは小数を2進数で近似するため誤差が生じます。整数で計算してから割ると回避できます。' },
];

export function getFAQAnswer(question: string): string | null {
  const q = question.toLowerCase();
  for (const entry of FAQ) {
    if (entry.keywords.some(k => q.includes(k))) return entry.answer;
  }
  return null;
}
