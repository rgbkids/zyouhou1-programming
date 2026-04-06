// Deterministic advice engine based on learning history

import { getStore, getWeakTopics } from '../history/localStorageRepo';

export interface Advice {
  weaknesses: string[];
  nextActions: string[];
  reviewCandidates: string[];
  encouragement: string;
  metrics: {
    overallAccuracy: number;
    hintDependency: number;
    studyFrequency: string;
    totalAttempts: number;
  };
}

const TOPIC_LABELS: Record<string, string> = {
  variables: '変数・代入', operators: '演算子', branch: '分岐',
  loop: 'ループ', list: 'リスト', function: '関数',
  random: '乱数', 'algorithm-search': '線形探索・二分探索',
  'algorithm-sort': '選択ソート・クイックソート',
  'numeric-error': '浮動小数点誤差', webapi: 'WebAPI', device: 'デバイス', simulation: 'シミュレーション',
};

const ENCOURAGEMENTS = [
  '毎日少しずつ続けることが大切です。焦らず進みましょう！',
  '間違いは成長のチャンス。何度でも挑戦してください！',
  '苦手分野を発見できたことが一番の収穫です。',
  '継続は力なり。今日の積み上げが実力になります！',
  'あきらめずに取り組む姿勢が大切です。応援しています！',
];

export function generateAdvice(): Advice {
  const store = getStore();
  const weakTopics = getWeakTopics();

  // Overall accuracy
  const totalAttempts = store.events.length;
  const totalCorrect = store.events.filter(e => e.correct).length;
  const overallAccuracy = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;

  // Hint dependency
  const hintUsed = store.events.filter(e => e.usedHint).length;
  const hintDependency = totalAttempts > 0 ? Math.round(hintUsed / totalAttempts * 100) : 0;

  // Study frequency (rough estimate)
  const recentDays = new Set(store.events.slice(-30).map(e => new Date(e.answeredAt).toLocaleDateString())).size;
  const studyFrequency = recentDays >= 5 ? '週5日以上' : recentDays >= 3 ? '週3-4日' : recentDays >= 1 ? '週1-2日' : '未学習';

  // Weaknesses
  const weaknesses = weakTopics.slice(0, 3).map(t => TOPIC_LABELS[t] ?? t);

  // Next actions
  const nextActions: string[] = [];
  if (weakTopics.length > 0) {
    nextActions.push(`「${TOPIC_LABELS[weakTopics[0]] ?? weakTopics[0]}」の問題を重点的に解きましょう`);
  }
  if (hintDependency > 50) {
    nextActions.push('ヒントを見る前に自力で考える時間を作りましょう');
  }
  if (totalAttempts < 10) {
    nextActions.push('まず練習問題を10問解いて基礎を固めましょう');
  }
  if (overallAccuracy < 60 && totalAttempts > 5) {
    nextActions.push('基礎レベルの問題から丁寧に取り組みましょう');
  }
  if (nextActions.length === 0) {
    nextActions.push('応用問題にも挑戦してみましょう');
  }

  // Review candidates (wrong problems)
  const reviewCandidates = Object.values(store.problemStats)
    .filter(ps => !ps.lastCorrect)
    .sort((a, b) => b.lastAttemptAt - a.lastAttemptAt)
    .slice(0, 3)
    .map(ps => ps.problemId);

  // Encouragement
  const enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];

  return {
    weaknesses,
    nextActions,
    reviewCandidates,
    encouragement: enc,
    metrics: { overallAccuracy, hintDependency, studyFrequency, totalAttempts },
  };
}
