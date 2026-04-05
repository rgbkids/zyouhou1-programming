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
      <div style={{ padding: 24, color: '#d4d4d4' }}>
        <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>復習</h2>
        <p>復習する問題がありません。まず練習問題を解いてみましょう。</p>
        <button onClick={onClose} style={{ padding: '6px 14px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>戻る</button>
      </div>
    );
  }

  function handleAnswer(correct: boolean, usedHint: boolean) {
    const { problem } = queue[idx];
    recordAnswer({ problemId: problem.id, topic: problem.topics[0], correct, durationMs: Date.now() - startTime.current, usedHint });
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    startTime.current = Date.now();
  }

  function next() {
    idx + 1 >= queue.length ? setDone(true) : setIdx(i => i + 1);
  }

  const btn = { padding: '6px 14px', background: '#0e639c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };

  if (done) {
    const pct = Math.round(score.correct / score.total * 100);
    return (
      <div style={{ padding: 24, color: '#d4d4d4' }}>
        <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>復習完了</h2>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: pct >= 80 ? '#89d185' : '#f48771' }}>{score.correct}/{score.total} 正解 ({pct}%)</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={btn} onClick={onClose}>終了</button>
        </div>
      </div>
    );
  }

  const { problem, reason } = queue[idx];
  return (
    <div style={{ padding: 16, maxWidth: 680, color: '#d4d4d4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <span style={{ color: '#888', fontSize: 12 }}>復習 {idx + 1}/{queue.length}</span>
          <span style={{ marginLeft: 10, fontSize: 11, background: '#3a2a00', color: '#dcdcaa', padding: '2px 8px', borderRadius: 10 }}>
            {reason}
          </span>
        </div>
        <button onClick={onClose} style={{ ...btn, background: '#3c3c3c', color: '#ccc', fontSize: 12 }}>中断</button>
      </div>
      <ProblemRenderer key={problem.id} problem={problem} onAnswer={handleAnswer} />
      <button style={{ ...btn, marginTop: 8 }} onClick={next}>
        {idx + 1 >= queue.length ? '結果を見る' : '次へ →'}
      </button>
    </div>
  );
}
