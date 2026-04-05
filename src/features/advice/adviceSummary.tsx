// Advice summary panel

import { useMemo } from 'react';
import { generateAdvice } from './adviceEngine';
import { getStore } from '../history/localStorageRepo';

export function AdviceSummary() {
  const store = getStore();
  const advice = useMemo(() => generateAdvice(), [store.events.length]);

  const card = { background: '#252526', borderRadius: 6, padding: 12, marginBottom: 12 };

  return (
    <div style={{ padding: 16, maxWidth: 600, color: '#d4d4d4' }}>
      <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>学習アドバイス</h2>

      {/* Metrics */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {[
          { label: '正答率', value: `${advice.metrics.overallAccuracy}%` },
          { label: 'ヒント依存', value: `${advice.metrics.hintDependency}%` },
          { label: '学習頻度', value: advice.metrics.studyFrequency },
          { label: '解答数', value: `${advice.metrics.totalAttempts}問` },
        ].map(m => (
          <div key={m.label} style={{ ...card, flex: 1, textAlign: 'center', marginBottom: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#4ec9b0' }}>{m.value}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Weaknesses */}
      {advice.weaknesses.length > 0 && (
        <div style={card}>
          <div style={{ color: '#f48771', fontWeight: 'bold', marginBottom: 6 }}>苦手分野</div>
          {advice.weaknesses.map(w => (
            <div key={w} style={{ fontSize: 13, color: '#d4d4d4', marginBottom: 4 }}>• {w}</div>
          ))}
        </div>
      )}

      {/* Next actions */}
      <div style={card}>
        <div style={{ color: '#dcdcaa', fontWeight: 'bold', marginBottom: 6 }}>次にやること</div>
        {advice.nextActions.map((a, i) => (
          <div key={i} style={{ fontSize: 13, color: '#d4d4d4', marginBottom: 4 }}>
            <span style={{ color: '#4ec9b0', marginRight: 6 }}>{i + 1}.</span>{a}
          </div>
        ))}
      </div>

      {/* Encouragement */}
      <div style={{ ...card, background: '#1a2a3a', border: '1px solid #0e639c', fontStyle: 'italic', color: '#9cdcfe' }}>
        💬 {advice.encouragement}
      </div>

      {advice.metrics.totalAttempts === 0 && (
        <div style={{ color: '#555', textAlign: 'center' }}>練習問題を解くとアドバイスが表示されます</div>
      )}
    </div>
  );
}
