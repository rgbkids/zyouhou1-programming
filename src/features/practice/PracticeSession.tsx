// Practice session — one problem at a time with history recording

import { useState, useRef } from 'react';
import type { Problem, Difficulty, TopicTag } from '../../content/problems/problemSchema';
import { PROBLEM_BANK } from '../../content/problems/problemBank';
import { ProblemRenderer } from './problemRenderer';
import { useHistoryStore } from '../history/historyStore';

type Filter = { difficulty?: Difficulty; topic?: TopicTag };

function pickProblems(filter: Filter, exclude: Set<string>): Problem[] {
  return PROBLEM_BANK.filter(p => {
    if (exclude.has(p.id)) return false;
    if (filter.difficulty && p.difficulty !== filter.difficulty) return false;
    if (filter.topic && !p.topics.includes(filter.topic)) return false;
    return true;
  });
}

const TOPICS: { value: TopicTag; label: string }[] = [
  { value: 'variables', label: '変数・代入' },
  { value: 'operators', label: '演算子' },
  { value: 'branch', label: '分岐' },
  { value: 'loop', label: 'ループ' },
  { value: 'list', label: 'リスト' },
  { value: 'function', label: '関数' },
  { value: 'algorithm-search', label: '探索' },
  { value: 'algorithm-sort', label: 'ソート' },
  { value: 'numeric-error', label: '数値誤差' },
];

export function PracticeSession({ onClose }: { onClose: () => void }) {
  const { recordAnswer } = useHistoryStore();
  const [filter, setFilter] = useState<Filter>({});
  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState<Problem[]>([]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const startTime = useRef(0);

  function start() {
    const problems = pickProblems(filter, new Set());
    if (problems.length === 0) return;
    const shuffled = [...problems].sort(() => Math.random() - 0.5).slice(0, 5);
    setQueue(shuffled);
    setIdx(0);
    setDone(false);
    setScore({ correct: 0, total: 0 });
    setStarted(true);
    startTime.current = Date.now();
  }

  function handleAnswer(correct: boolean, usedHint: boolean) {
    const problem = queue[idx];
    const durationMs = Date.now() - startTime.current;
    recordAnswer({ problemId: problem.id, topic: problem.topics[0], correct, durationMs, usedHint });
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    startTime.current = Date.now();
  }

  function next() {
    if (idx + 1 >= queue.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
    }
  }

  // ── Start screen ──────────────────────────────────────────
  if (!started) {
    return (
      <div className="panel">
        <h2 className="panel-title">練習問題</h2>
        <div className="card">
          <div className="mb-12">
            <div className="section-heading">難易度</div>
            <select
              className="select-field"
              value={filter.difficulty ?? ''}
              onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value as Difficulty || undefined }))}
            >
              <option value="">すべて</option>
              <option value="basic">基礎</option>
              <option value="standard">標準</option>
              <option value="advanced">応用</option>
            </select>
          </div>
          <div>
            <div className="section-heading">トピック</div>
            <select
              className="select-field"
              value={filter.topic ?? ''}
              onChange={e => setFilter(f => ({ ...f, topic: e.target.value as TopicTag || undefined }))}
            >
              <option value="">すべて</option>
              {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-row mt-16">
          <button className="btn btn-primary" onClick={start}>開始する</button>
          <button className="btn btn-secondary" onClick={onClose}>戻る</button>
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────
  if (done) {
    const pct = Math.round(score.correct / score.total * 100);
    const cls = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'bad';
    return (
      <div className="panel">
        <h2 className="panel-title">セッション完了</h2>
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div className={`score-display score-display--${cls}`}>
            {score.correct} <span style={{ fontSize: '0.5em', opacity: 0.6 }}>/ {score.total}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 6 }}>
            正解率 {pct}%
          </div>
        </div>
        <div className="flex-row mt-12">
          <button className="btn btn-primary" onClick={start}>もう一度</button>
          <button className="btn btn-secondary" onClick={onClose}>終了</button>
        </div>
      </div>
    );
  }

  // ── In-progress screen ────────────────────────────────────
  const problem = queue[idx];
  const progress = ((idx) / queue.length) * 100;
  return (
    <div className="panel">
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="session-header">
        <span className="session-meta">問題 {idx + 1} / {queue.length}</span>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>中断</button>
      </div>
      <ProblemRenderer key={problem.id} problem={problem} onAnswer={handleAnswer} />
      <button className="btn btn-primary mt-8" onClick={next}>
        {idx + 1 >= queue.length ? '結果を見る' : '次の問題へ →'}
      </button>
    </div>
  );
}
