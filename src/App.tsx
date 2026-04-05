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

import { PracticeSession } from './features/practice/PracticeSession';
import { ReviewSession } from './features/review/ReviewSession';
import { AbilityTestSession } from './features/exam/AbilityTestSession';
import { ProgressDashboard } from './features/history/ProgressDashboard';
import { AdviceSummary } from './features/advice/adviceSummary';
import { AITeacherPanel } from './features/ai/AITeacherPanel';

import { ResponsiveShell } from './components/layout/ResponsiveShell';
import type { TabId } from './components/layout/MobileTabs';
import './styles/responsive.css';

const DEFAULT_CODE = `# 情報I インタプリタへようこそ！
# サンプルを選択するか、ここにコードを書いて「実行」を押してください

x = 10
y = 20
print("x + y =", x + y)

for i in range(5):
    print(i)
`;

// Desktop panel tabs
type DesktopTab = 'none' | 'practice' | 'review' | 'exam' | 'history' | 'advice' | 'ai';

function createWebAPICache(): WebAPICache {
  const map = new Map<string, string>();
  return {
    get: (name, params) => map.get(`${name}:${JSON.stringify(params)}`),
    set: (name, params, result) => map.set(`${name}:${JSON.stringify(params)}`, result),
  };
}

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: '3px 10px',
  fontSize: 12,
  background: active ? '#0e639c' : '#3c3c3c',
  color: active ? '#fff' : '#ccc',
  border: '1px solid #555',
  borderRadius: 3,
  cursor: 'pointer',
});

export default function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [buffer, setBuffer] = useState<IOBuffer>({ lines: [], errors: [] });
  const [runState, setRunState] = useState<RunState>('idle');
  const [selectedSample, setSelectedSample] = useState('');
  const [deviceState, setDeviceState] = useState<DeviceState>(createDefaultDeviceState());
  const [showDevice, setShowDevice] = useState(false);
  const [showNumericHint, setShowNumericHint] = useState(false);
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('none');
  const webAPICache = useRef(createWebAPICache());

  const lastError = buffer.errors.length > 0 ? buffer.errors[buffer.errors.length - 1].message : undefined;

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

  function toggleDesktopTab(tab: DesktopTab) {
    setDesktopTab(prev => prev === tab ? 'none' : tab);
  }

  // ─── Panel content factory ───────────────────────────────────────────────
  function makePanels(): Partial<Record<TabId, { title: string; content: React.ReactNode }>> {
    return {
      practice: {
        title: '練習問題',
        content: <PracticeSession onClose={() => setDesktopTab('none')} />,
      },
      review: {
        title: '復習セッション',
        content: <ReviewSession onClose={() => setDesktopTab('none')} />,
      },
      exam: {
        title: '実力テスト',
        content: <AbilityTestSession onClose={() => setDesktopTab('none')} />,
      },
      history: {
        title: '学習履歴',
        content: <ProgressDashboard />,
      },
      ai: {
        title: 'AI先生',
        content: (
          <AITeacherPanel
            currentCode={code}
            lastError={lastError}
          />
        ),
      },
    };
  }

  // ─── Desktop right panel ──────────────────────────────────────────────────
  function DesktopPanel() {
    if (desktopTab === 'none') return null;
    if (desktopTab === 'advice') {
      return (
        <div style={{ width: 360, background: '#252526', borderLeft: '1px solid #333', overflowY: 'auto' }}>
          <AdviceSummary />
        </div>
      );
    }
    const panels = makePanels();
    const panel = panels[desktopTab as TabId];
    if (!panel) return null;
    return (
      <div style={{ width: 400, background: '#252526', borderLeft: '1px solid #333', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {panel.content}
      </div>
    );
  }

  // ─── Header ──────────────────────────────────────────────────────────────
  const header = (
    <>
      <span style={{ fontWeight: 'bold', color: '#9cdcfe', fontSize: 15 }}>情報I インタプリタ</span>
      <ConsolePanel state={runState} />
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button style={tabBtnStyle(desktopTab === 'practice')} onClick={() => toggleDesktopTab('practice')}>練習</button>
        <button style={tabBtnStyle(desktopTab === 'review')} onClick={() => toggleDesktopTab('review')}>復習</button>
        <button style={tabBtnStyle(desktopTab === 'exam')} onClick={() => toggleDesktopTab('exam')}>テスト</button>
        <button style={tabBtnStyle(desktopTab === 'history')} onClick={() => toggleDesktopTab('history')}>履歴</button>
        <button style={tabBtnStyle(desktopTab === 'advice')} onClick={() => toggleDesktopTab('advice')}>アドバイス</button>
        <button style={tabBtnStyle(desktopTab === 'ai')} onClick={() => toggleDesktopTab('ai')}>AI先生</button>
        <button
          onClick={() => setShowDevice(v => !v)}
          style={tabBtnStyle(showDevice)}
        >デバイス</button>
        <button
          onClick={() => setShowNumericHint(v => !v)}
          style={tabBtnStyle(showNumericHint)}
        >数値ヒント</button>
      </div>
    </>
  );

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  const sidebar = (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Toolbar
        samples={SAMPLES}
        selectedSample={selectedSample}
        onSelectSample={handleSelectSample}
        onRun={handleRun}
        onReset={handleReset}
        runState={runState}
      />
      {showDevice && (
        <DevicePanel
          state={deviceState}
          onChange={patch => setDeviceState(prev => ({ ...prev, ...patch }))}
        />
      )}
      {showNumericHint && <NumericHintPanel />}
    </div>
  );

  // ─── Main area ────────────────────────────────────────────────────────────
  const main = (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Toolbar (desktop inline above editor) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile toolbar strip */}
        <div className="mobile-only" style={{ padding: '4px 12px', background: '#252526', borderBottom: '1px solid #333' }}>
          <Toolbar
            samples={SAMPLES}
            selectedSample={selectedSample}
            onSelectSample={handleSelectSample}
            onRun={handleRun}
            onReset={handleReset}
            runState={runState}
          />
        </div>

        {/* Editor */}
        <div style={{ flex: '0 0 55%' }}>
          <MonacoWorkbench code={code} onChange={setCode} height="100%" />
        </div>

        {/* Output */}
        <div style={{ flex: 1, padding: 12, overflowY: 'auto', borderTop: '1px solid #333' }}>
          <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>出力</div>
          <OutputPanel buffer={buffer} />
        </div>
      </div>

      {/* Desktop feature panels */}
      <div className="desktop-only">
        <DesktopPanel />
      </div>
    </div>
  );

  return (
    <ResponsiveShell
      header={header}
      sidebar={sidebar}
      main={main}
      panels={makePanels()}
    />
  );
}
