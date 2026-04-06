import { useEffect, useState } from 'react';
import type { DeviceSimulator, DeviceState } from '../runtime/device.js';

interface Props {
  device: DeviceSimulator;
}

export function DevicePanel({ device }: Props) {
  const [state, setState] = useState<DeviceState>(() => device.getState() as DeviceState);

  useEffect(() => {
    return device.subscribe(s => setState({ ...s }));
  }, [device]);

  const handleSensor = (
    key: 'accelerometer_x' | 'temperature' | 'light_level',
    value: number
  ) => {
    device.setSensor(key, value);
  };

  return (
    <div className="device-panel">
      <div className="panel-header">デバイス（模擬）</div>
      <div className="device-led">{state.ledText || '　'}</div>
      <div className="device-sensors">
        <div className="sensor-row">
          <label>加速度 X</label>
          <input
            type="range" min={-1024} max={1024}
            value={state.accelerometer_x}
            onChange={e => handleSensor('accelerometer_x', Number(e.target.value))}
          />
          <span className="sensor-val">{state.accelerometer_x}</span>
        </div>
        <div className="sensor-row">
          <label>温度 (℃)</label>
          <input
            type="range" min={-20} max={60}
            value={state.temperature}
            onChange={e => handleSensor('temperature', Number(e.target.value))}
          />
          <span className="sensor-val">{state.temperature}</span>
        </div>
        <div className="sensor-row">
          <label>照度</label>
          <input
            type="range" min={0} max={255}
            value={state.light_level}
            onChange={e => handleSensor('light_level', Number(e.target.value))}
          />
          <span className="sensor-val">{state.light_level}</span>
        </div>
      </div>
    </div>
  );
}
