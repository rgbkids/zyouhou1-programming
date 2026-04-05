// React hooks for learning history

import { useState, useCallback } from 'react';
import type { HistoryStore, HistoryEvent } from './historySchema';
import { addEvent as repoAddEvent, getStore, getWrongProblems, getWeakTopics } from './localStorageRepo';
import type { TopicTag } from '../../content/problems/problemSchema';

let _eventIdCounter = Date.now();
function newEventId(): string {
  return `evt-${++_eventIdCounter}`;
}

export function useHistoryStore() {
  const [store, setStore] = useState<HistoryStore>(() => getStore());

  const recordAnswer = useCallback((params: {
    problemId: string;
    topic: TopicTag;
    correct: boolean;
    durationMs: number;
    usedHint: boolean;
  }) => {
    const event: HistoryEvent = {
      id: newEventId(),
      problemId: params.problemId,
      topic: params.topic,
      correct: params.correct,
      answeredAt: Date.now(),
      durationMs: params.durationMs,
      usedHint: params.usedHint,
    };
    repoAddEvent(event);
    setStore(getStore());
  }, []);

  const refresh = useCallback(() => setStore(getStore()), []);

  return {
    store,
    recordAnswer,
    refresh,
    wrongProblems: getWrongProblems(),
    weakTopics: getWeakTopics(),
  };
}
