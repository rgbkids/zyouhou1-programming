// Review selector — prioritizes wrong answers and weak topics

import { getWrongProblems, getWeakTopics, getStore } from '../history/localStorageRepo';
import { PROBLEM_BANK, getProblemsByTopic } from '../../content/problems/problemBank';
import type { Problem } from '../../content/problems/problemSchema';

export type ReviewReason = '最近間違えた' | 'topic の正答率が低い' | '長期間未復習';

export interface ReviewCandidate {
  problem: Problem;
  reason: ReviewReason;
}

const STALE_DAYS = 7;

function staleProblemIds(): string[] {
  const store = getStore();
  const cutoff = Date.now() - STALE_DAYS * 86400000;
  return Object.values(store.problemStats)
    .filter(ps => ps.lastAttemptAt < cutoff && ps.lastAttemptAt > 0)
    .map(ps => ps.problemId);
}

export function buildReviewQueue(maxItems = 5): ReviewCandidate[] {
  const seen = new Set<string>();
  const queue: ReviewCandidate[] = [];

  // 1. Recently wrong
  for (const id of getWrongProblems().slice(0, 10)) {
    if (seen.has(id)) continue;
    const p = PROBLEM_BANK.find(x => x.id === id);
    if (p) { queue.push({ problem: p, reason: '最近間違えた' }); seen.add(id); }
    if (queue.length >= maxItems) return queue;
  }

  // 2. Weak topic problems
  for (const topic of getWeakTopics()) {
    for (const p of getProblemsByTopic(topic).slice(0, 3)) {
      if (seen.has(p.id)) continue;
      queue.push({ problem: p, reason: 'topic の正答率が低い' }); seen.add(p.id);
      if (queue.length >= maxItems) return queue;
    }
  }

  // 3. Stale problems
  for (const id of staleProblemIds()) {
    if (seen.has(id)) continue;
    const p = PROBLEM_BANK.find(x => x.id === id);
    if (p) { queue.push({ problem: p, reason: '長期間未復習' }); seen.add(id); }
    if (queue.length >= maxItems) return queue;
  }

  // 4. Fallback: random problems from problem bank
  if (queue.length === 0) {
    const shuffled = [...PROBLEM_BANK].sort(() => Math.random() - 0.5);
    for (const p of shuffled) {
      if (seen.has(p.id)) continue;
      queue.push({ problem: p, reason: '最近間違えた' }); seen.add(p.id);
      if (queue.length >= maxItems) break;
    }
  }

  return queue;
}
