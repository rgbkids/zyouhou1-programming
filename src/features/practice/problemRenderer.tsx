// Renders a single problem based on its type

import { useState } from 'react';
import type { Problem } from '../../content/problems/problemSchema';
import { MonacoWorkbench } from '../../ui/MonacoWorkbench';

interface Props {
  problem: Problem;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
}

const s = {
  box: { background: '#252526', borderRadius: 6, padding: 16, marginBottom: 12 } as const,
  label: { fontSize: 11, color: '#888', marginBottom: 4 } as const,
  statement: { fontSize: 15, color: '#d4d4d4', marginBottom: 12, lineHeight: 1.6 } as const,
  code: { background: '#1e1e1e', fontFamily: 'monospace', fontSize: 13, padding: 10, borderRadius: 4, whiteSpace: 'pre', overflowX: 'auto', marginBottom: 12, color: '#ce9178' } as const,
  btn: (primary?: boolean) => ({
    padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer',
    background: primary ? '#0e639c' : '#3c3c3c', color: '#fff', marginRight: 8,
  } as const),
  choiceBtn: (selected: boolean, correct?: boolean) => ({
    display: 'block', width: '100%', textAlign: 'left' as const,
    padding: '8px 12px', marginBottom: 6, borderRadius: 4, border: '1px solid',
    borderColor: selected ? (correct ? '#89d185' : '#f48771') : '#555',
    background: selected ? (correct ? '#1a3a1a' : '#3a1a1a') : '#2d2d2d',
    color: '#d4d4d4', cursor: 'pointer', fontSize: 14,
  }),
  explanation: { background: '#1a2a1a', border: '1px solid #3a5a3a', borderRadius: 4, padding: 10, color: '#89d185', fontSize: 13, lineHeight: 1.6 } as const,
};

export function ProblemRenderer({ problem, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [monacoCode, setMonacoCode] = useState(problem.code ?? '');
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  function submit(answerCorrect: boolean) {
    setAnswered(true);
    setCorrect(answerCorrect);
    onAnswer(answerCorrect, showHint);
  }

  function checkMultipleChoice(choiceId: string) {
    if (answered) return;
    setSelected(choiceId);
    const choice = problem.choices?.find(c => c.id === choiceId);
    if (choice) submit(choice.isCorrect);
  }

  function checkFillBlank() {
    if (answered) return;
    const ok = problem.blankAnswers?.some(a => a.trim() === input.trim()) ?? false;
    submit(ok);
  }

  function checkPredictOutput() {
    if (answered) return;
    const ok = input.trim() === (problem.expectedOutput ?? '').trim();
    submit(ok);
  }

  function checkFixCode() {
    if (answered) return;
    // Simple check: run or accept any non-empty diff — in full impl, run through evaluator
    submit(monacoCode.trim() !== (problem.code ?? '').trim());
  }

  return (
    <div>
      {/* Problem header */}
      <div style={s.box}>
        <div style={s.label}>
          {problem.difficulty === 'basic' ? '基礎' : problem.difficulty === 'standard' ? '標準' : '応用'} ／{' '}
          {problem.topics.join(', ')}
        </div>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#9cdcfe', marginBottom: 8 }}>{problem.title}</div>
        <div style={s.statement}>{problem.statement}</div>
        {problem.code && <div style={s.code}>{problem.code}</div>}
        <button style={s.btn()} onClick={() => setShowHint(h => !h)}>
          {showHint ? 'ヒントを隠す' : 'ヒントを見る'}
        </button>
        {showHint && (
          <div style={{ marginTop: 8, color: '#dcdcaa', fontSize: 13 }}>
            💡 {problem.relatedTopics?.join(', ')} の知識を使います。
          </div>
        )}
      </div>

      {/* Answer area */}
      <div style={s.box}>
        {problem.type === 'multiple-choice' && (
          <>
            {problem.choices?.map(choice => (
              <button
                key={choice.id}
                style={s.choiceBtn(selected === choice.id, choice.isCorrect)}
                onClick={() => checkMultipleChoice(choice.id)}
                disabled={answered}
              >
                {choice.text}
              </button>
            ))}
          </>
        )}

        {(problem.type === 'fill-blank' || problem.type === 'predict-output') && (
          <div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="答えを入力..."
              disabled={answered}
              style={{ width: '100%', padding: 8, background: '#1e1e1e', border: '1px solid #555', color: '#d4d4d4', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
            />
            <button style={{ ...s.btn(true), marginTop: 8 }} onClick={problem.type === 'fill-blank' ? checkFillBlank : checkPredictOutput} disabled={answered}>
              回答する
            </button>
          </div>
        )}

        {(problem.type === 'fix-code' || problem.type === 'code-reading') && (
          <div>
            {problem.usesMonaco ? (
              <>
                <div style={s.label}>コードを修正してください</div>
                <MonacoWorkbench code={monacoCode} onChange={setMonacoCode} height="180px" />
                <button style={{ ...s.btn(true), marginTop: 8 }} onClick={checkFixCode} disabled={answered}>
                  提出する
                </button>
              </>
            ) : (
              <div>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="出力を入力..."
                  disabled={answered}
                  style={{ width: '100%', padding: 8, background: '#1e1e1e', border: '1px solid #555', color: '#d4d4d4', borderRadius: 4, fontSize: 14, boxSizing: 'border-box' }}
                />
                <button style={{ ...s.btn(true), marginTop: 8 }} onClick={checkPredictOutput} disabled={answered}>
                  回答する
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result + explanation */}
      {answered && (
        <div style={s.box}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: correct ? '#89d185' : '#f48771', marginBottom: 8 }}>
            {correct ? '✓ 正解！' : '✗ 不正解'}
          </div>
          <div style={s.explanation}>{problem.explanation}</div>
          {!correct && problem.wrongReasons && (
            <div style={{ marginTop: 8, color: '#f48771', fontSize: 12 }}>
              よくある間違い: {problem.wrongReasons.join(' / ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
