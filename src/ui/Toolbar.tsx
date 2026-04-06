import type { SampleDefinition } from "../samples";

type ToolbarProps = {
  running: boolean;
  samples: SampleDefinition[];
  selectedSampleId: string;
  onRun: () => void;
  onReset: () => void;
  onLoadSample: (id: string) => void;
};

export function Toolbar({
  running,
  samples,
  selectedSampleId,
  onRun,
  onReset,
  onLoadSample,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <button className="toolbar-button toolbar-button-primary" onClick={onRun} disabled={running}>
        Run
      </button>
      <button className="toolbar-button" onClick={onReset}>
        Reset
      </button>
      <label className="toolbar-select">
        <span>Sample</span>
        <select value={selectedSampleId} onChange={(event) => onLoadSample(event.target.value)}>
          {samples.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.title}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
