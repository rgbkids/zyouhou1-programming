import type { OutputLine } from '../runtime/io.js';

interface Props {
  lines: readonly OutputLine[];
}

export function ConsolePanel({ lines }: Props) {
  return (
    <div className="console-panel">
      <div className="panel-header">出力</div>
      <div className="console-output">
        {lines.length === 0 ? (
          <span className="empty-hint">実行すると出力がここに表示されます</span>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={`line-${l.kind}`}>
              {l.text || '\u00a0'}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
