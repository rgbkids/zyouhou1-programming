export type RunState = 'idle' | 'running' | 'done' | 'error';

interface Props {
  state: RunState;
}

const LABEL: Record<RunState, string> = {
  idle: '待機中',
  running: '実行中…',
  done: '完了',
  error: 'エラー',
};

const COLOR: Record<RunState, string> = {
  idle: '#888',
  running: '#4ec9b0',
  done: '#89d185',
  error: '#f48771',
};

export function ConsolePanel({ state }: Props) {
  return (
    <div style={{ fontSize: 12, color: COLOR[state], padding: '4px 8px' }}>
      ● {LABEL[state]}
    </div>
  );
}
