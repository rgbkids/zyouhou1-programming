import type { DeviceState } from "../runtime/device";

interface Props {
  state: DeviceState;
  onChange: (updater: (prev: DeviceState) => DeviceState) => void;
}

export function DevicePanel({ state, onChange }: Props) {
  const { accelerometer, temperature, lightLevel, ledText, ledClear } = state;

  return (
    <div className="device-panel">
      <div className="pane-label">デバイスシミュレータ</div>
      <div className="device-grid">

        {/* LED display */}
        <div className="led-display" title="device.led_show() の出力">
          {ledClear ? "□□□□□" : ledText || "□□□□□"}
        </div>

        {/* Accelerometer X */}
        <div className="device-sensor">
          <label>加速度 X</label>
          <input
            type="range" min="-1024" max="1024" step="1"
            value={accelerometer.x}
            onChange={(e) =>
              onChange((s) => ({
                ...s,
                accelerometer: { ...s.accelerometer, x: Number(e.target.value) },
              }))
            }
          />
          <span className="val">{accelerometer.x}</span>
        </div>

        {/* Accelerometer Y */}
        <div className="device-sensor">
          <label>加速度 Y</label>
          <input
            type="range" min="-1024" max="1024" step="1"
            value={accelerometer.y}
            onChange={(e) =>
              onChange((s) => ({
                ...s,
                accelerometer: { ...s.accelerometer, y: Number(e.target.value) },
              }))
            }
          />
          <span className="val">{accelerometer.y}</span>
        </div>

        {/* Temperature */}
        <div className="device-sensor">
          <label>温度 (°C)</label>
          <input
            type="range" min="-10" max="50" step="0.5"
            value={temperature}
            onChange={(e) =>
              onChange((s) => ({ ...s, temperature: Number(e.target.value) }))
            }
          />
          <span className="val">{temperature}</span>
        </div>

        {/* Light level */}
        <div className="device-sensor">
          <label>照度</label>
          <input
            type="range" min="0" max="255" step="1"
            value={lightLevel}
            onChange={(e) =>
              onChange((s) => ({ ...s, lightLevel: Number(e.target.value) }))
            }
          />
          <span className="val">{lightLevel}</span>
        </div>

      </div>
    </div>
  );
}
