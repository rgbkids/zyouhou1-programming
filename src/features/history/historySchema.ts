// Learning history schema for localStorage persistence

import type { TopicTag } from '../../content/problems/problemSchema';

export interface HistoryEvent {
  id: string;             // UUID-like timestamp-based id
  problemId: string;
  topic: TopicTag;
  correct: boolean;
  answeredAt: number;     // Unix ms
  durationMs: number;
  usedHint: boolean;
}

export interface ProblemStats {
  problemId: string;
  attempts: number;
  correct: number;
  lastAttemptAt: number;
  lastCorrect: boolean;
}

export interface TopicStats {
  topic: TopicTag;
  attempts: number;
  correct: number;
  lastAttemptAt: number;
}

export interface HistoryStore {
  version: number;
  events: HistoryEvent[];           // 直近イベントログ（上限付き）
  problemStats: Record<string, ProblemStats>;
  topicStats: Record<string, TopicStats>;
  streakDays: number;
  lastStudyDate: string | null;     // 'YYYY-MM-DD'
}

export const CURRENT_VERSION = 1;
export const MAX_EVENTS = 500;

export function createEmptyStore(): HistoryStore {
  return {
    version: CURRENT_VERSION,
    events: [],
    problemStats: {},
    topicStats: {},
    streakDays: 0,
    lastStudyDate: null,
  };
}
