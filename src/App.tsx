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

import { Panel, Group as PanelGroup } from 'react-resizable-panels';
import { ResizeHandle } from './components/layout/ResizeHandle';
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
type DesktopTab = 'none' | 'practice' | 'review' | 'exam' | 'history' | 'advice';

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
    };
  }

  // ─── Desktop right panel ──────────────────────────────────────────────────
  function DesktopPanel() {
    if (desktopTab === 'none') return null;
    if (desktopTab === 'advice') {
      return (
        <div className="desktop-panel desktop-panel--narrow">
          <AdviceSummary />
        </div>
      );
    }
    const panels = makePanels();
    const panel = panels[desktopTab as TabId];
    if (!panel) return null;
    return (
      <div className="desktop-panel">
        {panel.content}
      </div>
    );
  }

  // ─── Header ──────────────────────────────────────────────────────────────
  const header = (
    <>
      <span className="brand">情報I</span>
      <ConsolePanel state={runState} />
      <nav className="header-tabs">
        <button className={`tab-btn${desktopTab === 'practice' ? ' tab-btn--active' : ''}`} onClick={() => toggleDesktopTab('practice')}>練習</button>
        <button className={`tab-btn${desktopTab === 'review' ? ' tab-btn--active' : ''}`} onClick={() => toggleDesktopTab('review')}>復習</button>
        <button className={`tab-btn${desktopTab === 'exam' ? ' tab-btn--active' : ''}`} onClick={() => toggleDesktopTab('exam')}>テスト</button>
        <button className={`tab-btn${desktopTab === 'history' ? ' tab-btn--active' : ''}`} onClick={() => toggleDesktopTab('history')}>履歴</button>
        <button className={`tab-btn tab-btn--secondary${desktopTab === 'advice' ? ' tab-btn--active' : ''}`} onClick={() => toggleDesktopTab('advice')}>アドバイス</button>
        <button
          className={`tab-btn tab-btn--secondary${showDevice ? ' tab-btn--active' : ''}`}
          onClick={() => setShowDevice(v => !v)}
        >デバイス</button>
        <button
          className={`tab-btn tab-btn--secondary${showNumericHint ? ' tab-btn--active' : ''}`}
          onClick={() => setShowNumericHint(v => !v)}
        >数値</button>
      </nav>
    </>
  );

  // ─── Sidebar ─────────────────────────────────────────────────────────────
  const sidebar = (
    <div className="sidebar-content">
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
  const editorColumnContent = (
    <>
      {/* Mobile toolbar strip */}
      <div className="mobile-only mobile-toolbar-strip">
        <Toolbar
          samples={SAMPLES}
          selectedSample={selectedSample}
          onSelectSample={handleSelectSample}
          onRun={handleRun}
          onReset={handleReset}
          runState={runState}
        />
      </div>

      {/* Editor + Output: vertical resizable split */}
      <PanelGroup orientation="vertical" className="editor-panel-group">
        <Panel defaultSize="55%" minSize="20%" className="editor-wrap">
          <MonacoWorkbench code={code} onChange={setCode} height="100%" />
        </Panel>
        <ResizeHandle direction="vertical" />
        <Panel defaultSize="45%" minSize="15%" className="output-wrap">
          <div className="output-label">出力</div>
          <div className="output-scroll">
            <OutputPanel buffer={buffer} />
          </div>
        </Panel>
      </PanelGroup>
    </>
  );

  const main = (
    <div className="main-split">
      {desktopTab === 'none' ? (
        <div className="editor-column">{editorColumnContent}</div>
      ) : (
        <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
          <Panel defaultSize="55%" minSize="25%" className="editor-column">
            {editorColumnContent}
          </Panel>
          <ResizeHandle direction="horizontal" className="desktop-only" />
          <Panel defaultSize="45%" minSize="20%" className="desktop-panel-wrap desktop-only">
            <DesktopPanel />
          </Panel>
        </PanelGroup>
      )}
    </div>
  );

  return (
    <>
      <ResponsiveShell
        header={header}
        sidebar={sidebar}
        main={main}
        panels={makePanels()}
      />
      <AITeacherPanel currentCode={code} lastError={lastError} />
    </>
  );
}
