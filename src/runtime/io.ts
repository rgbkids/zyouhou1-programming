export type ConsoleLine = {
  channel: "stdout" | "stderr" | "trace";
  text: string;
};

export class OutputBuffer {
  private readonly lines: ConsoleLine[] = [];

  write(channel: ConsoleLine["channel"], text: string) {
    this.lines.push({ channel, text });
  }

  clear() {
    this.lines.length = 0;
  }

  snapshot(): ConsoleLine[] {
    return [...this.lines];
  }
}
