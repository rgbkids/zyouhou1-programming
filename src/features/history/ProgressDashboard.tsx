// Progress dashboard — topic accuracy heatmap, streak, recent mistakes

import { useMemo } from 'react';
import { resetHistory, exportHistory } from './localStorageRepo';
import { useHistoryStore } from './historyStore';

const TOPIC_LABELS: Record<string, string> = {
  variables: '変数', operators: '演算子', branch: '分岐',
  loop: 'ループ', list: 'リスト', function: '関数',
  random: '乱数', 'algorithm-search': '探索', 'algorithm-sort': 'ソート',
  'numeric-error': '数値誤差', webapi: 'WebAPI', device: 'デバイス', simulation: 'シミュレーション',
};

function HeatCell({ pct, label }: { pct: number; label: string }) {
  const bg = pct >= 80 ? '#1a4a1a' : pct >= 50 ? '#4a3a00' : pct > 0 ? '#4a1a1a' : '#2d2d2d';
  const fg = pct >= 80 ? '#89d185' : pct >= 50 ? '#dcdcaa' : pct > 0 ? '#f48771' : '#555';
  return (
    <div style={{ background: bg, border: `1px solid ${fg}`, borderRadius: 4, padding: '6px 10px', fontSize: 12, color: fg, textAlign: 'center', minWidth: 80 }}>
      <div style={{ fontWeight: 'bold' }}>{pct > 0 ? `${pct}%` : '未学習'}</div>
      <div style={{ fontSize: 10, opacity: 0.8 }}>{label}</div>
    </div>
  );
}

export function ProgressDashboard() {
  const { store, refresh } = useHistoryStore();

  const topicRows = useMemo(() => {
    return Object.entries(TOPIC_LABELS).map(([key, label]) => {
      const ts = store.topicStats[key];
      const pct = ts && ts.attempts > 0 ? Math.round(ts.correct / ts.attempts * 100) : 0;
      return { key, label, pct, attempts: ts?.attempts ?? 0 };
    });
  }, [store.topicStats]);

  const recentMistakes = useMemo(() => {
    return store.events.filter(e => !e.correct).slice(-5).reverse();
  }, [store.events]);

  const totalAttempts = store.events.length;
  const totalCorrect = store.events.filter(e => e.correct).length;
  const overallPct = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;

  function handleExport() {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'info1-history.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    if (confirm('学習履歴をすべてリセットしますか？')) {
      resetHistory();
      refresh();
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 680, color: '#d4d4d4' }}>
      <h2 style={{ color: '#9cdcfe', marginTop: 0 }}>学習履歴</h2>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#252526', borderRadius: 6, padding: 12, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#4ec9b0' }}>{totalAttempts}</div>
          <div style={{ fontSize: 12, color: '#888' }}>解いた問題数</div>
        </div>
        <div style={{ background: '#252526', borderRadius: 6, padding: 12, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: overallPct >= 70 ? '#89d185' : '#dcdcaa' }}>{overallPct}%</div>
          <div style={{ fontSize: 12, color: '#888' }}>全体正答率</div>
        </div>
        <div style={{ background: '#252526', borderRadius: 6, padding: 12, flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ce9178' }}>{store.streakDays}</div>
          <div style={{ fontSize: 12, color: '#888' }}>連続学習日数</div>
        </div>
      </div>

      {/* Topic heatmap */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>トピック別正答率</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {topicRows.map(row => <HeatCell key={row.key} pct={row.pct} label={row.label} />)}
        </div>
      </div>

      {/* Recent mistakes */}
      {recentMistakes.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>最近の間違い</div>
          <div style={{ background: '#252526', borderRadius: 6, padding: 12 }}>
            {recentMistakes.map(e => (
              <div key={e.id} style={{ fontSize: 13, color: '#f48771', marginBottom: 4 }}>
                ✗ 問題 {e.problemId} ({TOPIC_LABELS[e.topic] ?? e.topic})
                <span style={{ color: '#555', marginLeft: 8, fontSize: 11 }}>
                  {new Date(e.answeredAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalAttempts === 0 && (
        <div style={{ color: '#555', textAlign: 'center', padding: 24 }}>まだ問題を解いていません</div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleExport} style={{ padding: '6px 12px', background: '#3c3c3c', color: '#ccc', border: '1px solid #555', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          エクスポート
        </button>
        <button onClick={handleReset} style={{ padding: '6px 12px', background: '#3c3c3c', color: '#f48771', border: '1px solid #555', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          リセット
        </button>
      </div>
    </div>
  );
}
