// Renders a single problem based on its type

import { useState } from 'react';
import type { Problem } from '../../content/problems/problemSchema';
import { MonacoWorkbench } from '../../ui/MonacoWorkbench';

interface Props {
  problem: Problem;
  onAnswer: (correct: boolean, usedHint: boolean) => void;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  basic: '基礎',
  standard: '標準',
  advanced: '応用',
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
    submit(monacoCode.trim() !== (problem.code ?? '').trim());
  }

  function choiceClass(choiceId: string, isCorrect: boolean) {
    if (selected !== choiceId) return 'choice-btn';
    return `choice-btn ${isCorrect ? 'choice-btn--correct' : 'choice-btn--wrong'}`;
  }

  return (
    <div>
      {/* Problem header */}
      <div className="card">
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <span className="badge badge--blue">
            {DIFFICULTY_LABEL[problem.difficulty] ?? problem.difficulty}
          </span>
          {problem.topics.map(t => (
            <span key={t} className="badge badge--violet">{t}</span>
          ))}
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 10 }}>
          {problem.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 10 }}>
          {problem.statement}
        </div>
        {problem.code && <div className="code-display">{problem.code}</div>}
        <button className="btn btn-secondary btn-sm" onClick={() => setShowHint(h => !h)}>
          {showHint ? 'ヒントを隠す' : '💡 ヒントを見る'}
        </button>
        {showHint && (
          <div className="feedback-box feedback-box--warning mt-8">
            {problem.relatedTopics?.join(', ')} の知識を使います。
          </div>
        )}
      </div>

      {/* Answer area */}
      <div className="card">
        {problem.type === 'multiple-choice' && (
          <>
            {problem.choices?.map(choice => (
              <button
                key={choice.id}
                className={choiceClass(choice.id, choice.isCorrect)}
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
              className="input-field"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="答えを入力..."
              disabled={answered}
            />
            <button
              className="btn btn-primary mt-8"
              onClick={problem.type === 'fill-blank' ? checkFillBlank : checkPredictOutput}
              disabled={answered}
            >
              回答する
            </button>
          </div>
        )}

        {(problem.type === 'fix-code' || problem.type === 'code-reading') && (
          <div>
            {problem.usesMonaco ? (
              <>
                <div className="section-heading mb-8">コードを修正してください</div>
                <MonacoWorkbench code={monacoCode} onChange={setMonacoCode} height="180px" />
                <button className="btn btn-primary mt-8" onClick={checkFixCode} disabled={answered}>
                  提出する
                </button>
              </>
            ) : (
              <div>
                <input
                  className="input-field"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="出力を入力..."
                  disabled={answered}
                />
                <button className="btn btn-primary mt-8" onClick={checkPredictOutput} disabled={answered}>
                  回答する
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result + explanation */}
      {answered && (
        <div className="card">
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: correct ? 'var(--accent)' : 'var(--red)',
            marginBottom: 10,
          }}>
            {correct ? '✓ 正解！' : '✗ 不正解'}
          </div>
          <div className={`feedback-box ${correct ? 'feedback-box--success' : 'feedback-box--error'}`}>
            {problem.explanation}
          </div>
          {!correct && problem.wrongReasons && (
            <div style={{ marginTop: 8, color: 'var(--amber)', fontSize: 12 }}>
              よくある間違い: {problem.wrongReasons.join(' / ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
