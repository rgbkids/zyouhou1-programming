import type { ConsoleLine } from "../runtime/io";
import { OutputPanel } from "./OutputPanel";

type ConsolePanelProps = {
  lines: ConsoleLine[];
};

export function ConsolePanel({ lines }: ConsolePanelProps) {
  return <OutputPanel lines={lines} />;
}
