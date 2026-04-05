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
    // Shuffle
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
    recordAnswer({
      problemId: problem.id,
      topic: problem.topics[0],
      correct,
      durationMs,
      usedHint,
    });
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

  const btnStyle = { padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer', background: '#0e639c', color: '#fff' };
  const selectStyle = { padding: '4px 8px', background: '#3c3c3c', color: '#ccc', border: '1px solid #555', borderRadius: 4 };

  if (!started) {
    return (
      <div style={{ padding: 24, maxWidth: 600 }}>
        <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>練習問題</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: '#888', fontSize: 13 }}>難易度</label>
          <br />
          <select style={{ ...selectStyle, marginTop: 4 }} value={filter.difficulty ?? ''} onChange={e => setFilter(f => ({ ...f, difficulty: e.target.value as Difficulty || undefined }))}>
            <option value="">すべて</option>
            <option value="basic">基礎</option>
            <option value="standard">標準</option>
            <option value="advanced">応用</option>
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#888', fontSize: 13 }}>トピック</label>
          <br />
          <select style={{ ...selectStyle, marginTop: 4 }} value={filter.topic ?? ''} onChange={e => setFilter(f => ({ ...f, topic: e.target.value as TopicTag || undefined }))}>
            <option value="">すべて</option>
            {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle} onClick={start}>開始する</button>
          <button style={{ ...btnStyle, background: '#3c3c3c' }} onClick={onClose}>戻る</button>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round(score.correct / score.total * 100);
    return (
      <div style={{ padding: 24, maxWidth: 600 }}>
        <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>セッション完了</h2>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: pct >= 80 ? '#89d185' : pct >= 50 ? '#dcdcaa' : '#f48771', marginBottom: 8 }}>
          {score.correct} / {score.total} 問正解 ({pct}%)
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button style={btnStyle} onClick={start}>もう一度</button>
          <button style={{ ...btnStyle, background: '#3c3c3c' }} onClick={onClose}>終了</button>
        </div>
      </div>
    );
  }

  const problem = queue[idx];
  return (
    <div style={{ padding: 16, maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#888', fontSize: 13 }}>問題 {idx + 1} / {queue.length}</span>
        <button style={{ ...btnStyle, background: '#3c3c3c', fontSize: 12 }} onClick={onClose}>中断</button>
      </div>
      <ProblemRenderer key={problem.id} problem={problem} onAnswer={handleAnswer} />
      <button style={{ ...btnStyle, marginTop: 8 }} onClick={next}>
        {idx + 1 >= queue.length ? '結果を見る' : '次の問題へ →'}
      </button>
    </div>
  );
}
