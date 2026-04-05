import type { OutputLine } from "../runtime/io";

interface Props {
  lines: OutputLine[];
}

export function OutputPanel({ lines }: Props) {
  return (
    <div className="console-output">
      {lines.length === 0 ? (
        <span className="console-empty">出力はここに表示されます</span>
      ) : (
        lines.map((l, i) => (
          <div key={i} className={`console-line ${l.kind === "stderr" ? "stderr" : ""}`}>
            {l.text}
          </div>
        ))
      )}
    </div>
  );
}
