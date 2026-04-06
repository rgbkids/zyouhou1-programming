// I/O model: output buffer and runtime interface

export interface OutputLine {
  kind: 'stdout' | 'stderr';
  text: string;
}

export class OutputBuffer {
  private lines: OutputLine[] = [];

  write(text: string): void {
    this.lines.push({ kind: 'stdout', text });
  }

  writeError(text: string): void {
    this.lines.push({ kind: 'stderr', text });
  }

  getLines(): readonly OutputLine[] {
    return this.lines;
  }

  clear(): void {
    this.lines = [];
  }
}

/** Injectable runtime interface - all side effects go through here */
export interface RuntimeInterface {
  print: (text: string) => void;
  random: (start: number, stop: number) => number;
  webapiGetJson: (name: string, params: Record<string, string>) => Promise<unknown>;
  deviceGet: (sensor: string) => number;
  deviceShow: (text: string) => void;
  deviceClear: () => void;
  /** Called each evaluation step; throw to stop execution */
  checkStep: () => void;
}

export function makeDefaultRuntime(buf: OutputBuffer, seed?: number): RuntimeInterface {
  let rng = makeLCG(seed ?? Date.now());

  return {
    print: (text) => buf.write(text),
    random: (start, stop) => {
      const range = stop - start;
      if (range <= 0) return start;
      return start + Math.abs(rng() % range);
    },
    webapiGetJson: async (_name, _params) => {
      throw new Error('WebAPI はこのモードでは利用できません');
    },
    deviceGet: (_sensor) => 0,
    deviceShow: (_text) => { /* no-op in default */ },
    deviceClear: () => { /* no-op */ },
    checkStep: () => { /* no-op - evaluator manages step count */ },
  };
}

/** Simple LCG pseudo-random number generator for reproducible tests */
function makeLCG(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s;
  };
}
