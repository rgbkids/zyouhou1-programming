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
    <div className="toolbar">
      <select
        className="sample-select"
        value={selectedSample}
        onChange={e => onSelectSample(e.target.value)}
      >
        <option value="">— サンプルを選択 —</option>
        {samples.map(s => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <button
        className="btn-run"
        onClick={onRun}
        disabled={running}
      >
        ▶ 実行
      </button>
      <button
        className="btn-reset"
        onClick={onReset}
      >
        ↺
      </button>
    </div>
  );
}
