// Ability test session UI

import { useState, useRef } from 'react';
import { generateExam } from './examGenerator';
import { scoreExam } from './examRubric';
import { createDefaultBlueprint } from './examSchema';
import type { ExamSession } from './examSchema';
import { ProblemRenderer } from '../practice/problemRenderer';
import { useHistoryStore } from '../history/historyStore';

const GRADE_COLORS: Record<string, string> = {
  S: 'var(--accent)',
  A: 'var(--teal)',
  B: 'var(--amber)',
  C: 'var(--blue)',
  D: 'var(--red)',
};

export function AbilityTestSession({ onClose }: { onClose: () => void }) {
  const { recordAnswer } = useHistoryStore();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const startTime = useRef(Date.now());

  function startExam() {
    const blueprint = createDefaultBlueprint();
    setSession(generateExam(blueprint));
    setIdx(0);
    setDone(false);
    startTime.current = Date.now();
  }

  function handleAnswer(correct: boolean, usedHint: boolean) {
    if (!session) return;
    const problem = session.problems[idx];
    recordAnswer({
      problemId: problem.id,
      topic: problem.topics[0],
      correct,
      durationMs: Date.now() - startTime.current,
      usedHint,
    });
    session.answers[problem.id] = { correct, usedHint };
    startTime.current = Date.now();
  }

  function next() {
    if (!session) return;
    if (idx + 1 >= session.problems.length) {
      session.finishedAt = Date.now();
      setDone(true);
    } else {
      setIdx(i => i + 1);
    }
  }

  // ── Start screen ──────────────────────────────────────────
  if (!session) {
    return (
      <div className="panel">
        <h2 className="panel-title">実力テスト</h2>
        <div className="card mb-12">
          <div style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 12, lineHeight: 1.65 }}>
            全トピックから5問出題します。結果は学習履歴に記録されます。
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text)' }}>問題数</span>
              <span style={{ color: 'var(--text-bright)', fontFamily: 'var(--font-mono)' }}>5問</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text)' }}>構成</span>
              <span style={{ color: 'var(--text-bright)', fontSize: 12 }}>基礎2 / 標準2 / 応用1</span>
            </div>
          </div>
        </div>
        <div className="flex-row">
          <button className="btn btn-primary" onClick={startExam}>開始する</button>
          <button className="btn btn-secondary" onClick={onClose}>戻る</button>
        </div>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────
  if (done) {
    const result = scoreExam(session.problems, session.answers);
    const gradeColor = GRADE_COLORS[result.grade] ?? 'var(--text)';
    return (
      <div className="panel">
        <h2 className="panel-title">テスト結果</h2>
        <div className="stats-row">
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <span className="grade-badge" style={{ color: gradeColor }}>{result.grade}</span>
            <span className="stat-label mt-8">評価</span>
          </div>
          <div className="stat-card" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ color: gradeColor }}>{result.score}</span>
            <span className="stat-label">{result.pass ? '✓ 合格' : '✗ 不合格'}</span>
          </div>
        </div>
        <div className="feedback-box feedback-box--info mb-12">
          {result.feedback}
        </div>
        <div className="card mb-12">
          <div className="section-heading mb-8">トピック別</div>
          {result.topicBreakdown.map(t => (
            <div key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
              <span style={{ color: 'var(--text-2)' }}>{t.topic}</span>
              <span style={{ color: t.correct === t.total ? 'var(--accent)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                {t.correct}/{t.total}
              </span>
            </div>
          ))}
        </div>
        <div className="flex-row">
          <button className="btn btn-primary" onClick={startExam}>もう一度</button>
          <button className="btn btn-secondary" onClick={onClose}>終了</button>
        </div>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────
  const problem = session.problems[idx];
  const progress = (idx / session.problems.length) * 100;
  return (
    <div className="panel">
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="session-header">
        <span className="session-meta">実力テスト {idx + 1} / {session.problems.length}</span>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>中断</button>
      </div>
      <ProblemRenderer key={problem.id} problem={problem} onAnswer={handleAnswer} />
      <button className="btn btn-primary mt-8" onClick={next}>
        {idx + 1 >= session.problems.length ? '結果を見る' : '次へ →'}
      </button>
    </div>
  );
}
