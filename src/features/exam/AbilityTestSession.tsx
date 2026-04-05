// Ability test session UI

import { useState, useRef } from 'react';
import { generateExam } from './examGenerator';
import { scoreExam } from './examRubric';
import { createDefaultBlueprint } from './examSchema';
import type { ExamSession } from './examSchema';
import { ProblemRenderer } from '../practice/problemRenderer';
import { useHistoryStore } from '../history/historyStore';

const btn = (primary?: boolean) => ({
  padding: '6px 16px', borderRadius: 4, border: 'none', cursor: 'pointer',
  background: primary ? '#0e639c' : '#3c3c3c', color: '#fff',
} as const);

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

  // Start screen
  if (!session) {
    return (
      <div style={{ padding: 24, maxWidth: 500, color: '#d4d4d4' }}>
        <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>実力テスト</h2>
        <p style={{ color: '#aaa', fontSize: 14 }}>
          全トピックから5問出題します。結果は学習履歴に記録されます。
        </p>
        <div style={{ background: '#252526', borderRadius: 6, padding: 12, marginBottom: 16, fontSize: 13 }}>
          <div>問題数: <strong>5問</strong></div>
          <div>構成: 基礎2問 / 標準2問 / 応用1問</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn(true)} onClick={startExam}>開始する</button>
          <button style={btn()} onClick={onClose}>戻る</button>
        </div>
      </div>
    );
  }

  // Result screen
  if (done) {
    const result = scoreExam(session.problems, session.answers);
    const gradeColor = { S: '#89d185', A: '#4ec9b0', B: '#dcdcaa', C: '#ce9178', D: '#f48771' }[result.grade];
    return (
      <div style={{ padding: 24, maxWidth: 560, color: '#d4d4d4' }}>
        <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>テスト結果</h2>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#252526', borderRadius: 6, padding: 16, textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: gradeColor }}>{result.grade}</div>
            <div style={{ fontSize: 12, color: '#888' }}>評価</div>
          </div>
          <div style={{ background: '#252526', borderRadius: 6, padding: 16, textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 36, fontWeight: 'bold', color: gradeColor }}>{result.score}点</div>
            <div style={{ fontSize: 12, color: '#888' }}>{result.pass ? '合格' : '不合格'}</div>
          </div>
        </div>
        <div style={{ background: '#1a2a3a', border: '1px solid #0e639c', borderRadius: 6, padding: 12, marginBottom: 16, color: '#9cdcfe', fontSize: 13 }}>
          {result.feedback}
        </div>
        <div style={{ background: '#252526', borderRadius: 6, padding: 12, marginBottom: 16 }}>
          <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>トピック別</div>
          {result.topicBreakdown.map(t => (
            <div key={t.topic} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: '#ccc' }}>{t.topic}</span>
              <span style={{ color: t.correct === t.total ? '#89d185' : '#f48771' }}>{t.correct}/{t.total}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn(true)} onClick={startExam}>もう一度</button>
          <button style={btn()} onClick={onClose}>終了</button>
        </div>
      </div>
    );
  }

  // Question screen
  const problem = session.problems[idx];
  return (
    <div style={{ padding: 16, maxWidth: 680, color: '#d4d4d4' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ color: '#888', fontSize: 13 }}>実力テスト {idx + 1} / {session.problems.length}</span>
        <button onClick={onClose} style={{ ...btn(), fontSize: 12 }}>中断</button>
      </div>
      <ProblemRenderer key={problem.id} problem={problem} onAnswer={handleAnswer} />
      <button style={{ ...btn(true), marginTop: 8 }} onClick={next}>
        {idx + 1 >= session.problems.length ? '結果を見る' : '次へ →'}
      </button>
    </div>
  );
}
