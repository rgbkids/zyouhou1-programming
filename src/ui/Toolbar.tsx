import type { Sample } from '../samples';
import type { RunState } from './ConsolePanel';

interface Props {
  samples: Sample[];
  selectedSample: string;
  onSelectSample: (id: string) => void;
  onRun: () => void;
  onReset: () => void;
  runState: RunState;
}

export function Toolbar({ samples, selectedSample, onSelectSample, onRun, onReset, runState }: Props) {
  const running = runState === 'running';
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
      <select
        value={selectedSample}
        onChange={e => onSelectSample(e.target.value)}
        style={{ padding: '4px 8px', borderRadius: 4, background: '#3c3c3c', color: '#ccc', border: '1px solid #555' }}
      >
        <option value="">-- サンプルを選択 --</option>
        {samples.map(s => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <button
        onClick={onRun}
        disabled={running}
        style={{ padding: '4px 16px', borderRadius: 4, background: running ? '#555' : '#0e639c', color: '#fff', border: 'none', cursor: running ? 'not-allowed' : 'pointer' }}
      >
        ▶ 実行
      </button>
      <button
        onClick={onReset}
        style={{ padding: '4px 12px', borderRadius: 4, background: '#3c3c3c', color: '#ccc', border: '1px solid #555', cursor: 'pointer' }}
      >
        ↺ リセット
      </button>
    </div>
  );
}
