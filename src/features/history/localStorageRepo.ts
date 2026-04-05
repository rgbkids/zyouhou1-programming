// localStorage repository with versioning, migration, and corruption recovery

import type { HistoryStore, HistoryEvent, TopicStats, ProblemStats } from './historySchema';
import { createEmptyStore, CURRENT_VERSION, MAX_EVENTS } from './historySchema';
import type { TopicTag } from '../../content/problems/problemSchema';

const PRIMARY_KEY = 'info1_history_v1';
const BACKUP_KEY = 'info1_history_backup';

function dateString(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function load(): HistoryStore {
  try {
    const raw = localStorage.getItem(PRIMARY_KEY);
    if (!raw) return createEmptyStore();
    const parsed = JSON.parse(raw) as HistoryStore;
    if (parsed.version !== CURRENT_VERSION) return migrate(parsed);
    return parsed;
  } catch {
    // Primary corrupted — try backup
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (backup) return JSON.parse(backup) as HistoryStore;
    } catch { /* ignore */ }
    return createEmptyStore();
  }
}

function migrate(old: Partial<HistoryStore>): HistoryStore {
  // Future migrations go here — for now return empty with events preserved if possible
  const fresh = createEmptyStore();
  if (Array.isArray(old.events)) fresh.events = old.events;
  return fresh;
}

function save(store: HistoryStore): void {
  try {
    // Save backup before overwriting primary
    const current = localStorage.getItem(PRIMARY_KEY);
    if (current) localStorage.setItem(BACKUP_KEY, current);
    localStorage.setItem(PRIMARY_KEY, JSON.stringify(store));
  } catch {
    // localStorage full — compress by dropping oldest events
    store.events = store.events.slice(-100);
    try { localStorage.setItem(PRIMARY_KEY, JSON.stringify(store)); } catch { /* ignore */ }
  }
}

export function addEvent(event: HistoryEvent): void {
  const store = load();
  const today = dateString(event.answeredAt);

  // Append event, trim to MAX_EVENTS
  store.events = [...store.events, event].slice(-MAX_EVENTS);

  // Update problem stats
  const ps: ProblemStats = store.problemStats[event.problemId] ?? {
    problemId: event.problemId, attempts: 0, correct: 0,
    lastAttemptAt: 0, lastCorrect: false,
  };
  ps.attempts += 1;
  if (event.correct) ps.correct += 1;
  ps.lastAttemptAt = event.answeredAt;
  ps.lastCorrect = event.correct;
  store.problemStats[event.problemId] = ps;

  // Update topic stats
  const ts: TopicStats = store.topicStats[event.topic] ?? {
    topic: event.topic, attempts: 0, correct: 0, lastAttemptAt: 0,
  };
  ts.attempts += 1;
  if (event.correct) ts.correct += 1;
  ts.lastAttemptAt = event.answeredAt;
  store.topicStats[event.topic] = ts;

  // Update streak
  if (store.lastStudyDate === null) {
    store.streakDays = 1;
  } else {
    const prev = new Date(store.lastStudyDate).getTime();
    const diffDays = Math.round((new Date(today).getTime() - prev) / 86400000);
    if (diffDays === 1) store.streakDays += 1;
    else if (diffDays > 1) store.streakDays = 1;
    // diffDays === 0: same day, keep streak
  }
  store.lastStudyDate = today;

  save(store);
}

export function getStore(): HistoryStore {
  return load();
}

export function getWrongProblems(): string[] {
  const store = load();
  return Object.values(store.problemStats)
    .filter(ps => !ps.lastCorrect)
    .sort((a, b) => b.lastAttemptAt - a.lastAttemptAt)
    .map(ps => ps.problemId);
}

export function getWeakTopics(): TopicTag[] {
  const store = load();
  return Object.values(store.topicStats)
    .filter(ts => ts.attempts > 0 && ts.correct / ts.attempts < 0.6)
    .sort((a, b) => (a.correct / a.attempts) - (b.correct / b.attempts))
    .map(ts => ts.topic);
}

export function resetHistory(): void {
  localStorage.removeItem(PRIMARY_KEY);
  localStorage.removeItem(BACKUP_KEY);
}

export function exportHistory(): string {
  return JSON.stringify(load(), null, 2);
}

export function importHistory(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as HistoryStore;
    if (typeof parsed.version !== 'number') return false;
    save(parsed);
    return true;
  } catch {
    return false;
  }
}
