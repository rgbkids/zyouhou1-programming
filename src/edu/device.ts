// Browser-based device simulation for the Jouhou-I sandbox
// No real hardware — everything is mocked in the browser UI

import type { Value, ModuleValue } from '../core/value';
import { num, NONE } from '../core/value';

export interface DeviceState {
  accelerometer_x: number;
  accelerometer_y: number;
  temperature: number;
  light: number;
  ledText: string;
  motorSpeed: number;
}

export interface DeviceStore {
  getState: () => DeviceState;
  setState: (patch: Partial<DeviceState>) => void;
}

export function createDeviceModule(store: DeviceStore): ModuleValue {
  return {
    type: 'module',
    name: 'device',
    attrs: {
      accelerometer_x: {
        type: 'builtin',
        name: 'accelerometer_x',
        call: (_args: Value[]) => num(store.getState().accelerometer_x),
      },
      accelerometer_y: {
        type: 'builtin',
        name: 'accelerometer_y',
        call: (_args: Value[]) => num(store.getState().accelerometer_y),
      },
      temperature: {
        type: 'builtin',
        name: 'temperature',
        call: (_args: Value[]) => num(store.getState().temperature),
      },
      light: {
        type: 'builtin',
        name: 'light',
        call: (_args: Value[]) => num(store.getState().light),
      },
      led_show: {
        type: 'builtin',
        name: 'led_show',
        call: (args: Value[]) => {
          const text = args.length > 0 ? String(args[0].type === 'number' ? args[0].value : args[0].type === 'string' ? args[0].value : '') : '';
          store.setState({ ledText: String(text) });
          return NONE;
        },
      },
      motor_speed: {
        type: 'builtin',
        name: 'motor_speed',
        call: (args: Value[]) => {
          const speed = args.length > 0 && args[0].type === 'number' ? args[0].value : 0;
          store.setState({ motorSpeed: speed });
          return NONE;
        },
      },
    },
  };
}

export function createDefaultDeviceState(): DeviceState {
  return {
    accelerometer_x: 0,
    accelerometer_y: 0,
    temperature: 25,
    light: 512,
    ledText: '',
    motorSpeed: 0,
  };
}
