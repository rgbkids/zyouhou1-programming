// Advice summary panel

import { useMemo } from 'react';
import { generateAdvice } from './adviceEngine';
import { getStore } from '../history/localStorageRepo';

export function AdviceSummary() {
  const store = getStore();
  const advice = useMemo(() => generateAdvice(), [store.events.length]);

  const metrics = [
    { label: '正答率',    value: `${advice.metrics.overallAccuracy}%`, cls: 'stat-value' },
    { label: 'ヒント依存', value: `${advice.metrics.hintDependency}%`,  cls: 'stat-value stat-value--amber' },
    { label: '学習頻度',  value: advice.metrics.studyFrequency,         cls: 'stat-value stat-value--teal' },
    { label: '解答数',    value: `${advice.metrics.totalAttempts}`,      cls: 'stat-value stat-value--blue' },
  ];

  return (
    <div className="panel">
      <h2 className="panel-title">学習アドバイス</h2>

      {/* Metrics */}
      <div className="stats-row mb-12">
        {metrics.map(m => (
          <div key={m.label} className="stat-card">
            <span className={m.cls}>{m.value}</span>
            <span className="stat-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Weaknesses */}
      {advice.weaknesses.length > 0 && (
        <div className="card mb-12">
          <div className="section-heading mb-8" style={{ color: 'var(--red)' }}>苦手分野</div>
          {advice.weaknesses.map(w => (
            <div key={w} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 5 }}>
              <span style={{ color: 'var(--red)', marginRight: 6 }}>•</span>{w}
            </div>
          ))}
        </div>
      )}

      {/* Next actions */}
      <div className="card mb-12">
        <div className="section-heading mb-8">次にやること</div>
        {advice.nextActions.map((a, i) => (
          <div key={i} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6, display: 'flex', gap: 8 }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11, flexShrink: 0, paddingTop: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {a}
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <div className="feedback-box feedback-box--info">
        💬 {advice.encouragement}
      </div>

      {advice.metrics.totalAttempts === 0 && (
        <div className="empty-state">練習問題を解くとアドバイスが表示されます</div>
      )}
    </div>
  );
}
