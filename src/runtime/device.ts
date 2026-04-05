// Device simulation layer for info1 runtime
// Provides mock sensors and actuators (no real hardware needed)

export interface DeviceState {
  accelerometer: { x: number; y: number; z: number };
  temperature: number;
  lightLevel: number;
  ledText: string;
  ledClear: boolean;
  motorSpeed: number;
}

export const DEFAULT_DEVICE_STATE: DeviceState = {
  accelerometer: { x: 0, y: 0, z: -1024 },
  temperature: 25,
  lightLevel: 128,
  ledText: "",
  ledClear: true,
  motorSpeed: 0,
};

export type DeviceUpdateFn = (updater: (prev: DeviceState) => DeviceState) => void;

/** Context object injected into the evaluator */
export interface DeviceContext {
  getState: () => DeviceState;
  setState: DeviceUpdateFn;
}

export function makeDeviceModule(ctx: DeviceContext) {
  return {
    accelerometer_x: () => ctx.getState().accelerometer.x,
    accelerometer_y: () => ctx.getState().accelerometer.y,
    accelerometer_z: () => ctx.getState().accelerometer.z,
    temperature:     () => ctx.getState().temperature,
    light_level:     () => ctx.getState().lightLevel,
    led_show: (text: string) => {
      ctx.setState((s) => ({ ...s, ledText: text, ledClear: false }));
    },
    led_clear: () => {
      ctx.setState((s) => ({ ...s, ledText: "", ledClear: true }));
    },
    motor_set: (speed: number) => {
      ctx.setState((s) => ({ ...s, motorSpeed: speed }));
    },
  };
}
