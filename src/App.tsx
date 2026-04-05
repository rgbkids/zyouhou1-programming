import { useMemo, useState } from "react";

import { MonacoWorkbench } from "./ui/MonacoWorkbench";
import { Toolbar } from "./ui/Toolbar";
import { ConsolePanel } from "./ui/ConsolePanel";
import { DevicePanel } from "./ui/DevicePanel";
import { NumericHintPanel } from "./ui/NumericHintPanel";
import { defaultSample, samples } from "./samples";
import { createRuntimeSession } from "./runtime/builtins";
import type { ConsoleLine } from "./runtime/io";
import type { DeviceState } from "./runtime/device";

export function App() {
  const [selectedSampleId, setSelectedSampleId] = useState(defaultSample.id);
  const [code, setCode] = useState(defaultSample.code);
  const [lines, setLines] = useState<ConsoleLine[]>([]);
  const [deviceState, setDeviceState] = useState<DeviceState>({
    temperature: 24,
    illuminance: 60,
    accelerometerX: 0,
    ledText: "READY",
    motorPower: 0,
  });
  const [running, setRunning] = useState(false);

  const currentSample = useMemo(
    () => samples.find((sample) => sample.id === selectedSampleId) ?? defaultSample,
    [selectedSampleId],
  );

  const runCode = () => {
    setRunning(true);
    const session = createRuntimeSession({
      randomRange: (stop) => (stop > 0 ? Math.min(1, stop - 1) : 0),
    });
    Object.assign(session.deviceState, deviceState);

    try {
      session.evaluator.run(code);
      setLines(session.output.snapshot());
      setDeviceState({ ...session.deviceState });
    } catch (error) {
      session.output.write("stderr", error instanceof Error ? error.message : String(error));
      setLines(session.output.snapshot());
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setCode(currentSample.code);
    setLines([]);
  };

  const loadSample = (id: string) => {
    const sample = samples.find((entry) => entry.id === id) ?? defaultSample;
    setSelectedSampleId(sample.id);
    setCode(sample.code);
    setLines([]);
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <section className="hero-card">
          <div className="hero-kicker">Information I Harness</div>
          <h1>Browser Interpreter Studio</h1>
          <p>
            Monaco editor, safe AST evaluator, mock WebAPI, and device simulation arranged as a single
            teaching workbench for 情報I.
          </p>
          <div className="hero-stats">
            <span>Monaco Workbench</span>
            <span>AST Runtime</span>
            <span>Device Mock</span>
            <span>Trace-ready Samples</span>
          </div>
        </section>
        <section className="panel-card">
          <div className="panel-head">
            <span>Sample Focus</span>
          </div>
          <h2>{currentSample.title}</h2>
          <p className="sample-note">{currentSample.note}</p>
          <p className="panel-text">
            Use the sample selector to switch from control flow to device, WebAPI, numeric error, and
            simulation examples without changing the evaluator interface.
          </p>
        </section>
      </header>

      <div className="layout">
        <main className="workspace">
          <Toolbar
            running={running}
            samples={samples}
            selectedSampleId={selectedSampleId}
            onRun={runCode}
            onReset={reset}
            onLoadSample={loadSample}
          />
          <MonacoWorkbench code={code} onChange={setCode} />
          <ConsolePanel lines={lines} />
        </main>

        <aside className="sidebar">
          <DevicePanel state={deviceState} onChange={setDeviceState} />
          <NumericHintPanel />
        </aside>
      </div>
    </div>
  );
}
