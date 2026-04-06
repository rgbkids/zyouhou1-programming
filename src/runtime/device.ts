import type { RuntimeValue } from "./value";

export type DeviceState = {
  temperature: number;
  illuminance: number;
  accelerometerX: number;
  ledText: string;
  motorPower: number;
};

export function createDeviceState(): DeviceState {
  return {
    temperature: 24,
    illuminance: 60,
    accelerometerX: 0,
    ledText: "READY",
    motorPower: 0,
  };
}

export function createDeviceHooks(state: DeviceState): Record<string, (...args: RuntimeValue[]) => RuntimeValue> {
  return {
    temperature: () => state.temperature,
    illuminance: () => state.illuminance,
    accelerometer_x: () => state.accelerometerX,
    led_show: (text) => {
      state.ledText = String(text ?? "");
      return state.ledText;
    },
    motor_set: (power) => {
      state.motorPower = Number(power ?? 0);
      return state.motorPower;
    },
  };
}
