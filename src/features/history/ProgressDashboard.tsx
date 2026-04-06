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

function heatClass(pct: number) {
  if (pct >= 80) return 'heat-cell--good';
  if (pct >= 50) return 'heat-cell--mid';
  if (pct > 0)   return 'heat-cell--bad';
  return 'heat-cell--none';
}

function HeatCell({ pct, label }: { pct: number; label: string }) {
  return (
    <div className={`heat-cell ${heatClass(pct)}`}>
      <span className="heat-cell__value">{pct > 0 ? `${pct}%` : '—'}</span>
      <span className="heat-cell__label">{label}</span>
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
    <div className="panel">
      <h2 className="panel-title">学習履歴</h2>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-value stat-value--teal">{totalAttempts}</span>
          <span className="stat-label">解いた問題数</span>
        </div>
        <div className="stat-card">
          <span className={`stat-value ${overallPct >= 70 ? '' : 'stat-value--amber'}`}>
            {overallPct}%
          </span>
          <span className="stat-label">全体正答率</span>
        </div>
        <div className="stat-card">
          <span className="stat-value stat-value--amber">{store.streakDays}</span>
          <span className="stat-label">連続学習日数</span>
        </div>
      </div>

      {/* Topic heatmap */}
      <div className="mb-16">
        <div className="section-heading mb-8">トピック別正答率</div>
        <div className="heat-grid">
          {topicRows.map(row => <HeatCell key={row.key} pct={row.pct} label={row.label} />)}
        </div>
      </div>

      {/* Recent mistakes */}
      {recentMistakes.length > 0 && (
        <div className="mb-16">
          <div className="section-heading mb-8">最近の間違い</div>
          <div className="card">
            {recentMistakes.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--red)' }}>
                  ✗ {TOPIC_LABELS[e.topic] ?? e.topic}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {new Date(e.answeredAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalAttempts === 0 && (
        <div className="empty-state">まだ問題を解いていません</div>
      )}

      {/* Actions */}
      <div className="flex-row">
        <button className="btn btn-secondary btn-sm" onClick={handleExport}>
          エクスポート
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleReset}>
          リセット
        </button>
      </div>
    </div>
  );
}
