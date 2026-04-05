import type { Problem, TopicTag, Difficulty } from '../../content/problems/problemSchema';

export interface ExamBlueprint {
  totalQuestions: number;
  topicDistribution: Partial<Record<TopicTag, number>>;
  difficultyDistribution: Record<Difficulty, number>;
  typeRatios: {
    'multiple-choice': number;
    'predict-output': number;
    'fill-blank': number;
    'fix-code': number;
    'code-reading': number;
  };
}

export interface ExamSession {
  id: string;
  blueprint: ExamBlueprint;
  problems: Problem[];
  startedAt: number;
  finishedAt?: number;
  answers: Record<string, { correct: boolean; usedHint: boolean }>;
}

export function createDefaultBlueprint(): ExamBlueprint {
  return {
    totalQuestions: 5,
    topicDistribution: {},   // empty = all topics balanced
    difficultyDistribution: { basic: 2, standard: 2, advanced: 1 },
    typeRatios: { 'multiple-choice': 40, 'predict-output': 30, 'fill-blank': 15, 'fix-code': 10, 'code-reading': 5 },
  };
}
