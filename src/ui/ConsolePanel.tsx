export type RunState = 'idle' | 'running' | 'done' | 'error';

interface Props {
  state: RunState;
}

const LABEL: Record<RunState, string> = {
  idle:    '待機中',
  running: '実行中',
  done:    '完了',
  error:   'エラー',
};

export function ConsolePanel({ state }: Props) {
  return (
    <div className={`status-pill status-pill--${state}`}>
      <span className="status-dot" />
      {LABEL[state]}
    </div>
  );
}
