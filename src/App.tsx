import { useState, useCallback, useRef } from 'react';
import { Toolbar } from './ui/Toolbar.js';
import { MonacoWorkbench } from './ui/MonacoWorkbench.js';
import { ConsolePanel } from './ui/ConsolePanel.js';
import { DevicePanel } from './ui/DevicePanel.js';
import { NumericHintPanel } from './ui/NumericHintPanel.js';
import { getSampleById } from './samples/index.js';
import { OutputBuffer, makeDefaultRuntime } from './runtime/io.js';
import { DeviceSimulator } from './runtime/device.js';
import { Evaluator } from './runtime/evaluator.js';
import { parse } from './lang/parser.js';
import type { OutputLine } from './runtime/io.js';

const DEFAULT_CODE = `# 情報I インタプリタへようこそ！
# サンプルを選ぶか、自分でコードを書いてみましょう。

print("Hello, 情報I!")
for i in range(1, 6):
    print(i, "の2乗 =", i * i)
`;

const device = new DeviceSimulator();

export function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [running, setRunning] = useState(false);
  const [errorLine, setErrorLine] = useState<number | undefined>(undefined);
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false });

  const handleRun = useCallback(() => {
    setRunning(true);
    setOutput([]);
    setErrorLine(undefined);
    abortRef.current = { aborted: false };
    const abort = abortRef.current;

    // Run synchronously in a timeout to allow UI to update
    setTimeout(() => {
      const buf = new OutputBuffer();
      const rt = makeDefaultRuntime(buf);

      // Wire device simulator
      rt.deviceGet = (sensor: string) => device.getSensor(sensor);
      rt.deviceShow = (text: string) => device.ledShow(text);
      rt.deviceClear = () => device.ledClear();

      let errorMsg: string | undefined;
      let errLine: number | undefined;

      try {
        const program = parse(code);
        const evaluator = new Evaluator(rt);
        evaluator.run(program);
      } catch (e) {
        errorMsg = (e as Error).message;
        errLine = (e as { line?: number }).line;
      }

      if (abort.aborted) return;

      const lines = [...buf.getLines()];
      if (errorMsg) {
        lines.push({ kind: 'stderr', text: `エラー: ${errorMsg}` });
      }

      setOutput(lines);
      setErrorLine(errLine);
      setRunning(false);
    }, 0);
  }, [code]);

  const handleReset = useCallback(() => {
    abortRef.current.aborted = true;
    setOutput([]);
    setErrorLine(undefined);
    setRunning(false);
    device.ledClear();
  }, []);

  const handleLoadSample = useCallback((id: string) => {
    const sample = getSampleById(id);
    if (sample) {
      setCode(sample.code);
      setOutput([]);
      setErrorLine(undefined);
    }
  }, []);

  return (
    <div className="app">
      <Toolbar
        running={running}
        onRun={handleRun}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
      />
      <div className="main-pane">
        <MonacoWorkbench
          code={code}
          onChange={setCode}
          errorLine={errorLine}
        />
        <div className="right-pane">
          <ConsolePanel lines={output} />
          <DevicePanel device={device} />
          <NumericHintPanel />
        </div>
      </div>
    </div>
  );
}
