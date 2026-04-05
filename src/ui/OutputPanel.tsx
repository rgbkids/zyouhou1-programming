import type { IOBuffer } from '../core/io';

interface Props {
  buffer: IOBuffer;
}

export function OutputPanel({ buffer }: Props) {
  return (
    <div className="output-panel">
      {buffer.lines.map((line, i) => (
        <div key={i} className="output-line">{line}</div>
      ))}
      {buffer.errors.map((err, i) => (
        <div key={`e${i}`} className="output-error">
          {err.line ? `[Line ${err.line}] ` : ''}{err.message}
        </div>
      ))}
      {buffer.lines.length === 0 && buffer.errors.length === 0 && (
        <div className="output-empty">（出力なし）</div>
      )}
    </div>
  );
}
