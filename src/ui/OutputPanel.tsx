import type { ConsoleLine } from "../runtime/io";

type OutputPanelProps = {
  lines: ConsoleLine[];
};

export function OutputPanel({ lines }: OutputPanelProps) {
  return (
    <section className="output-panel">
      <div className="panel-head">
        <span>Console</span>
      </div>
      <div className="console-lines">
        {lines.length === 0 ? <p className="console-empty">No output yet.</p> : null}
        {lines.map((line, index) => (
          <pre key={`${line.channel}-${index}`} className={`console-line console-line-${line.channel}`}>
            <span className="console-channel">{line.channel}</span>
            {line.text}
          </pre>
        ))}
      </div>
    </section>
  );
}
