interface SampleOption {
  label: string;
  value: string;
}

interface Props {
  isRunning: boolean;
  samples: SampleOption[];
  selectedSample: string;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onSampleChange: (value: string) => void;
}

export function Toolbar({
  isRunning,
  samples,
  selectedSample,
  onRun,
  onStop,
  onReset,
  onSampleChange,
}: Props) {
  return (
    <div className="toolbar">
      <span className="toolbar-title">情報I インタプリタ</span>

      <button
        className="btn btn-run"
        disabled={isRunning}
        onClick={onRun}
        title="コードを実行 (Ctrl+Enter)"
      >
        ▶ 実行
      </button>

      <button
        className="btn btn-stop"
        disabled={!isRunning}
        onClick={onStop}
        title="実行を停止"
      >
        ■ 停止
      </button>

      <button
        className="btn btn-reset"
        disabled={isRunning}
        onClick={onReset}
        title="出力をクリア"
      >
        クリア
      </button>

      <select
        className="sample-select"
        value={selectedSample}
        onChange={(e) => onSampleChange(e.target.value)}
        disabled={isRunning}
        title="サンプルを読み込む"
      >
        <option value="">— サンプルを選択 —</option>
        {samples.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {isRunning && (
        <div className="running-badge">
          <div className="running-dot" />
          実行中…
        </div>
      )}
    </div>
  );
}
