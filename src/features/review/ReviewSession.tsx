// Review session UI

import { useState, useRef } from 'react';
import { buildReviewQueue } from './reviewSelector';
import { ProblemRenderer } from '../practice/problemRenderer';
import { useHistoryStore } from '../history/historyStore';

export function ReviewSession({ onClose }: { onClose: () => void }) {
  const { recordAnswer } = useHistoryStore();
  const [queue] = useState(() => buildReviewQueue(5));
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const startTime = useRef(Date.now());

  if (queue.length === 0) {
    return (
      <div className="panel">
        <h2 className="panel-title">復習</h2>
        <div className="feedback-box feedback-box--info mb-16">
          復習する問題がありません。まず練習問題を解いてみましょう。
        </div>
        <button className="btn btn-secondary" onClick={onClose}>戻る</button>
      </div>
    );
  }

  function handleAnswer(correct: boolean, usedHint: boolean) {
    const { problem } = queue[idx];
    recordAnswer({
      problemId: problem.id,
      topic: problem.topics[0],
      correct,
      durationMs: Date.now() - startTime.current,
      usedHint,
    });
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    startTime.current = Date.now();
  }

  function next() {
    idx + 1 >= queue.length ? setDone(true) : setIdx(i => i + 1);
  }

  // ── Result screen ─────────────────────────────────────────
  if (done) {
    const pct = Math.round(score.correct / score.total * 100);
    const cls = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'bad';
    return (
      <div className="panel">
        <h2 className="panel-title">復習完了</h2>
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div className={`score-display score-display--${cls}`}>
            {score.correct} <span style={{ fontSize: '0.5em', opacity: 0.6 }}>/ {score.total}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 6 }}>
            正解率 {pct}%
          </div>
        </div>
        <div className="flex-row mt-12">
          <button className="btn btn-secondary" onClick={onClose}>終了</button>
        </div>
      </div>
    );
  }

  // ── In-progress screen ────────────────────────────────────
  const { problem, reason } = queue[idx];
  const progress = (idx / queue.length) * 100;
  return (
    <div className="panel">
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="session-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="session-meta">復習 {idx + 1}/{queue.length}</span>
          <span className="badge badge--amber">{reason}</span>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>中断</button>
      </div>
      <ProblemRenderer key={problem.id} problem={problem} onAnswer={handleAnswer} />
      <button className="btn btn-primary mt-8" onClick={next}>
        {idx + 1 >= queue.length ? '結果を見る' : '次へ →'}
      </button>
    </div>
  );
}
