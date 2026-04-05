import { useState, useCallback, useRef } from 'react';
import { MonacoWorkbench } from './ui/MonacoWorkbench';
import { OutputPanel } from './ui/OutputPanel';
import { Toolbar } from './ui/Toolbar';
import { ConsolePanel, type RunState } from './ui/ConsolePanel';
import { DevicePanel } from './edu/DevicePanel';
import { NumericHintPanel } from './edu/NumericHintPanel';
import { tokenize } from './core/tokenizer';
import { parse } from './core/parser';
import { evaluate } from './core/evaluator';
import { createBuffer, type IOBuffer } from './core/io';
import { createGlobals } from './builtins/builtins';
import { createWebAPIModule, prefetchWebAPI, type WebAPICache } from './edu/webapi';
import { createDeviceModule, createDefaultDeviceState, type DeviceState } from './edu/device';
import { SAMPLES } from './samples';

const DEFAULT_CODE = `# 情報I インタプリタへようこそ！
# サンプルを選択するか、ここにコードを書いて「実行」を押してください

x = 10
y = 20
print("x + y =", x + y)

for i in range(5):
    print(i)
`;

function createWebAPICache(): WebAPICache {
  const map = new Map<string, string>();
  return {
    get: (name, params) => map.get(`${name}:${JSON.stringify(params)}`),
    set: (name, params, result) => map.set(`${name}:${JSON.stringify(params)}`, result),
  };
}

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [buffer, setBuffer] = useState<IOBuffer>({ lines: [], errors: [] });
  const [runState, setRunState] = useState<RunState>('idle');
  const [selectedSample, setSelectedSample] = useState('');
  const [deviceState, setDeviceState] = useState<DeviceState>(createDefaultDeviceState());
  const [showDevice, setShowDevice] = useState(false);
  const [showNumericHint, setShowNumericHint] = useState(false);
  const webAPICache = useRef(createWebAPICache());

  const handleSelectSample = useCallback((id: string) => {
    setSelectedSample(id);
    const sample = SAMPLES.find(s => s.id === id);
    if (sample) {
      setCode(sample.code);
      setBuffer({ lines: [], errors: [] });
      setRunState('idle');
      setShowDevice(sample.category === 'デバイス');
      setShowNumericHint(sample.category === '数値');
    }
  }, []);

  const handleRun = useCallback(async () => {
    setRunState('running');
    setBuffer({ lines: [], errors: [] });

    try {
      await prefetchWebAPI(code, webAPICache.current);

      const { buffer: buf, hooks } = createBuffer();
      let latestDeviceState = deviceState;
      const deviceStore = {
        getState: () => latestDeviceState,
        setState: (patch: Partial<DeviceState>) => {
          latestDeviceState = { ...latestDeviceState, ...patch };
          setDeviceState(latestDeviceState);
        },
      };

      const globals = {
        ...createGlobals(hooks),
        webapi: createWebAPIModule(webAPICache.current),
        device: createDeviceModule(deviceStore),
      };

      const tokens = tokenize(code);
      const ast = parse(tokens);
      evaluate(ast, { io: hooks, globals });

      setBuffer({ ...buf });
      setRunState('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setBuffer(prev => ({
        lines: prev.lines,
        errors: [...prev.errors, { message: msg }],
      }));
      setRunState('error');
    }
  }, [code, deviceState]);

  const handleReset = useCallback(() => {
    setBuffer({ lines: [], errors: [] });
    setRunState('idle');
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#1e1e1e', color: '#d4d4d4', fontFamily: 'sans-serif',
      margin: 0,
    }}>
      {/* Header */}
      <div style={{ background: '#252526', padding: '8px 16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontWeight: 'bold', color: '#9cdcfe' }}>情報I インタプリタ</span>
        <ConsolePanel state={runState} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowDevice(v => !v)}
            style={{ padding: '2px 8px', fontSize: 11, background: showDevice ? '#0e639c' : '#3c3c3c', color: '#ccc', border: '1px solid #555', borderRadius: 3, cursor: 'pointer' }}
          >
            デバイス
          </button>
          <button
            onClick={() => setShowNumericHint(v => !v)}
            style={{ padding: '2px 8px', fontSize: 11, background: showNumericHint ? '#0e639c' : '#3c3c3c', color: '#ccc', border: '1px solid #555', borderRadius: 3, cursor: 'pointer' }}
          >
            数値ヒント
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '0 16px', background: '#252526', borderBottom: '1px solid #333' }}>
        <Toolbar
          samples={SAMPLES}
          selectedSample={selectedSample}
          onSelectSample={handleSelectSample}
          onRun={handleRun}
          onReset={handleReset}
          runState={runState}
        />
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editor + Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: '0 0 55%' }}>
            <MonacoWorkbench code={code} onChange={setCode} height="100%" />
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto', borderTop: '1px solid #333' }}>
            <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>出力</div>
            <OutputPanel buffer={buffer} />
          </div>
        </div>

        {/* Side panels */}
        {(showDevice || showNumericHint) && (
          <div style={{ width: 280, padding: 12, background: '#252526', borderLeft: '1px solid #333', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            {showDevice && (
              <DevicePanel
                state={deviceState}
                onChange={patch => setDeviceState(prev => ({ ...prev, ...patch }))}
              />
            )}
            {showNumericHint && <NumericHintPanel />}
          </div>
        )}
      </div>
    </div>
  );
}
