// I/O model for info1 runtime

export type OutputKind = "stdout" | "stderr";

export interface OutputLine {
  kind: OutputKind;
  text: string;
}

export class IOBuffer {
  private lines: OutputLine[] = [];
  private listeners: ((line: OutputLine) => void)[] = [];

  write(text: string, kind: OutputKind = "stdout"): void {
    const line: OutputLine = { kind, text };
    this.lines.push(line);
    this.listeners.forEach((fn) => fn(line));
  }

  stdout(text: string): void { this.write(text, "stdout"); }
  stderr(text: string): void { this.write(text, "stderr"); }

  getLines(): OutputLine[] { return [...this.lines]; }

  clear(): void { this.lines = []; }

  onLine(fn: (line: OutputLine) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }
}
