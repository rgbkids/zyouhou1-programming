import type { DeviceState } from "../runtime/device";

type DevicePanelProps = {
  state: DeviceState;
  onChange: (next: DeviceState) => void;
};

export function DevicePanel({ state, onChange }: DevicePanelProps) {
  return (
    <section className="device-panel panel-card">
      <div className="panel-head">
        <span>Device Mock</span>
      </div>
      <div className="device-grid">
        <label>
          Temperature
          <input
            type="range"
            min="0"
            max="40"
            value={state.temperature}
            onChange={(event) => onChange({ ...state, temperature: Number(event.target.value) })}
          />
          <strong>{state.temperature}C</strong>
        </label>
        <label>
          Illuminance
          <input
            type="range"
            min="0"
            max="100"
            value={state.illuminance}
            onChange={(event) => onChange({ ...state, illuminance: Number(event.target.value) })}
          />
          <strong>{state.illuminance}</strong>
        </label>
        <label>
          Accelerometer X
          <input
            type="range"
            min="-10"
            max="10"
            value={state.accelerometerX}
            onChange={(event) => onChange({ ...state, accelerometerX: Number(event.target.value) })}
          />
          <strong>{state.accelerometerX}</strong>
        </label>
      </div>
      <div className="device-display">
        <div className="led-badge">{state.ledText}</div>
        <div className="motor-badge">Motor {state.motorPower}</div>
      </div>
    </section>
  );
}
