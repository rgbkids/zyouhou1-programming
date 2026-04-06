import { SAMPLES } from '../samples/index.js';

interface Props {
  running: boolean;
  onRun: () => void;
  onReset: () => void;
  onLoadSample: (id: string) => void;
}

export function Toolbar({ running, onRun, onReset, onLoadSample }: Props) {
  return (
    <div className="toolbar">
      <span className="app-title">情報I インタプリタ</span>

      <select
        defaultValue=""
        onChange={e => { if (e.target.value) onLoadSample(e.target.value); e.target.value = ''; }}
      >
        <option value="">── サンプルを読み込む ──</option>
        {SAMPLES.map(s => (
          <option key={s.id} value={s.id}>[{s.category}] {s.label}</option>
        ))}
      </select>

      <button className="btn-run" onClick={onRun} disabled={running}>
        {running ? '実行中…' : '▶ 実行'}
      </button>
      <button className="btn-reset" onClick={onReset}>
        ↺ リセット
      </button>
    </div>
  );
}
