// I/O interface for the Jouhou-I runtime

export interface IOHooks {
  print: (line: string) => void;
  error: (msg: string, line?: number) => void;
}

export interface IOBuffer {
  lines: string[];
  errors: { message: string; line?: number }[];
}

export function createBuffer(): { buffer: IOBuffer; hooks: IOHooks } {
  const buffer: IOBuffer = { lines: [], errors: [] };
  const hooks: IOHooks = {
    print: (line) => buffer.lines.push(line),
    error: (message, line) => buffer.errors.push({ message, line }),
  };
  return { buffer, hooks };
}
