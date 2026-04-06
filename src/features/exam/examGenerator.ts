// Exam generator — blueprint-based problem selection (AI-fallback to static bank)

import type { ExamBlueprint, ExamSession } from './examSchema';
import type { Problem, Difficulty } from '../../content/problems/problemSchema';
import { PROBLEM_BANK } from '../../content/problems/problemBank';

let _sessionCounter = Date.now();

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateExam(blueprint: ExamBlueprint): ExamSession {
  const selected: Problem[] = [];
  const used = new Set<string>();

  // Ensure difficulty distribution
  const diffKeys: Difficulty[] = ['basic', 'standard', 'advanced'];
  for (const diff of diffKeys) {
    const count = blueprint.difficultyDistribution[diff] ?? 0;
    const pool = shuffle(PROBLEM_BANK.filter(p => p.difficulty === diff && !used.has(p.id)));
    for (const p of pool.slice(0, count)) {
      selected.push(p);
      used.add(p.id);
    }
  }

  // Fill remaining with any unused problems
  const remaining = blueprint.totalQuestions - selected.length;
  if (remaining > 0) {
    const filler = shuffle(PROBLEM_BANK.filter(p => !used.has(p.id)));
    selected.push(...filler.slice(0, remaining));
  }

  // Validate: must have at least 1 problem
  const final = selected.length > 0 ? selected : shuffle(PROBLEM_BANK).slice(0, blueprint.totalQuestions);

  return {
    id: `exam-${++_sessionCounter}`,
    blueprint,
    problems: final.slice(0, blueprint.totalQuestions),
    startedAt: Date.now(),
    answers: {},
  };
}
