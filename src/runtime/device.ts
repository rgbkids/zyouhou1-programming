// Device simulation: sensor mock and LED output

export interface DeviceState {
  accelerometer_x: number;
  accelerometer_y: number;
  temperature: number;
  light_level: number;
  ledText: string;
  motorSpeed: number;
}

export type DeviceStateListener = (state: DeviceState) => void;

export class DeviceSimulator {
  private state: DeviceState = {
    accelerometer_x: 0,
    accelerometer_y: 0,
    temperature: 25,
    light_level: 128,
    ledText: '',
    motorSpeed: 0,
  };

  private listeners: DeviceStateListener[] = [];

  getSensor(name: string): number {
    switch (name) {
      case 'accelerometer_x': return this.state.accelerometer_x;
      case 'accelerometer_y': return this.state.accelerometer_y;
      case 'temperature': return this.state.temperature;
      case 'light_level': return this.state.light_level;
      default: return 0;
    }
  }

  ledShow(text: string): void {
    this.state = { ...this.state, ledText: text };
    this.notify();
  }

  ledClear(): void {
    this.state = { ...this.state, ledText: '' };
    this.notify();
  }

  setSensor(name: keyof Pick<DeviceState, 'accelerometer_x' | 'accelerometer_y' | 'temperature' | 'light_level'>, value: number): void {
    this.state = { ...this.state, [name]: value };
    this.notify();
  }

  getState(): Readonly<DeviceState> {
    return this.state;
  }

  subscribe(listener: DeviceStateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    for (const l of this.listeners) l(this.state);
  }
}
