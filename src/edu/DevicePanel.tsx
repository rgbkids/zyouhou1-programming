import type { DeviceState } from './device';

interface Props {
  state: DeviceState;
  onChange: (patch: Partial<DeviceState>) => void;
}

function Slider({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 130, color: '#ccc' }}>{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ width: 40, color: '#aaa', textAlign: 'right' }}>{value}</span>
    </label>
  );
}

export function DevicePanel({ state, onChange }: Props) {
  return (
    <div style={{ background: '#252526', padding: 12, borderRadius: 4, fontSize: 12 }}>
      <div style={{ color: '#9cdcfe', marginBottom: 8, fontWeight: 'bold' }}>デバイスシミュレータ</div>

      {/* LED Display */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: '#888', marginBottom: 4 }}>LED 表示</div>
        <div style={{
          background: '#000', color: '#0f0', fontFamily: 'monospace',
          fontSize: 24, textAlign: 'center', padding: '8px 16px',
          borderRadius: 4, minHeight: 40, letterSpacing: 4,
        }}>
          {state.ledText || ' '}
        </div>
      </div>

      {/* Sensors */}
      <Slider label="加速度 X" value={state.accelerometer_x} min={-100} max={100}
        onChange={v => onChange({ accelerometer_x: v })} />
      <Slider label="加速度 Y" value={state.accelerometer_y} min={-100} max={100}
        onChange={v => onChange({ accelerometer_y: v })} />
      <Slider label="温度 (℃)" value={state.temperature} min={-20} max={50}
        onChange={v => onChange({ temperature: v })} />
      <Slider label="光センサ" value={state.light} min={0} max={1023}
        onChange={v => onChange({ light: v })} />

      {/* Motor */}
      <div style={{ marginTop: 8, color: '#888' }}>
        モーター速度: <span style={{ color: '#4ec9b0' }}>{state.motorSpeed}</span>
      </div>
    </div>
  );
}
