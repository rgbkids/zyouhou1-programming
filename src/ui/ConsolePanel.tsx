import { useEffect, useRef } from "react";
import type { OutputLine } from "../runtime/io";
import { OutputPanel } from "./OutputPanel";

interface Props {
  lines: OutputLine[];
  title?: string;
}

export function ConsolePanel({ lines, title = "出力" }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  return (
    <div className="console-panel">
      <div className="pane-label">{title}</div>
      <OutputPanel lines={lines} />
      <div ref={bottomRef} />
    </div>
  );
}
