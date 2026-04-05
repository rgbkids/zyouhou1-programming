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
    <div className="device-slider-row">
      <span className="device-slider-label">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, accentColor: 'var(--accent)' }}
      />
      <span className="device-slider-value">{value}</span>
    </div>
  );
}

export function DevicePanel({ state, onChange }: Props) {
  return (
    <div className="device-panel">
      <div className="section-heading mb-8">デバイスシミュレータ</div>

      {/* LED Display */}
      <div className="device-led">
        {state.ledText || '\u00a0'}
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

      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span style={{ color: 'var(--text)' }}>モーター速度</span>
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{state.motorSpeed}</span>
      </div>
    </div>
  );
}
