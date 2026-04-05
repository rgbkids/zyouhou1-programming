import type { IOBuffer } from '../core/io';

interface Props {
  buffer: IOBuffer;
}

export function OutputPanel({ buffer }: Props) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: 14, background: '#1e1e1e', color: '#d4d4d4', padding: 12, minHeight: 120, overflowY: 'auto', borderRadius: 4 }}>
      {buffer.lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {buffer.errors.map((err, i) => (
        <div key={`e${i}`} style={{ color: '#f48771' }}>
          {err.line ? `[Line ${err.line}] ` : ''}{err.message}
        </div>
      ))}
      {buffer.lines.length === 0 && buffer.errors.length === 0 && (
        <div style={{ color: '#555' }}>（出力なし）</div>
      )}
    </div>
  );
}
