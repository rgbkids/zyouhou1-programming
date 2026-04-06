// Rubric for exam scoring and feedback

import type { Problem } from '../../content/problems/problemSchema';

export interface RubricResult {
  pass: boolean;
  score: number;        // 0-100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  feedback: string;
  topicBreakdown: { topic: string; correct: number; total: number }[];
}

export function scoreExam(
  problems: Problem[],
  answers: Record<string, { correct: boolean }>,
): RubricResult {
  const total = problems.length;
  const correct = Object.values(answers).filter(a => a.correct).length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const grade: RubricResult['grade'] =
    score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D';

  const topicMap = new Map<string, { correct: number; total: number }>();
  for (const p of problems) {
    const topic = p.topics[0];
    const entry = topicMap.get(topic) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (answers[p.id]?.correct) entry.correct += 1;
    topicMap.set(topic, entry);
  }

  const feedback =
    grade === 'S' ? '素晴らしい！全分野が高水準です。' :
    grade === 'A' ? 'よくできました。少しの弱点を克服すれば完璧です。' :
    grade === 'B' ? '基礎はできています。苦手分野の復習を続けましょう。' :
    grade === 'C' ? '練習が必要です。基礎問題から丁寧に取り組みましょう。' :
    '基礎から見直しましょう。復習機能を使って弱点を補強してください。';

  return {
    pass: score >= 60,
    score,
    grade,
    feedback,
    topicBreakdown: [...topicMap.entries()].map(([topic, v]) => ({ topic, ...v })),
  };
}
