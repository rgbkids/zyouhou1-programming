import { useEffect, useRef, useCallback, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { Toolbar } from "./Toolbar";
import { ConsolePanel } from "./ConsolePanel";
import { DevicePanel } from "./DevicePanel";
import { NumericHintPanel } from "./NumericHintPanel";
import { IOBuffer, OutputLine } from "../runtime/io";
import { Evaluator } from "../runtime/evaluator";
import { parse, ParseError, TokenizeError } from "../lang/parser";
import type { DeviceState } from "../runtime/device";
import { DEFAULT_DEVICE_STATE } from "../runtime/device";
import type { SampleEntry } from "../samples/index";
import { SAMPLES } from "../samples/index";

const INITIAL_CODE = `# 情報I インタプリタへようこそ！
# サンプルを選ぶか、ここにコードを書いて「実行」を押してください。

for i in range(1, 6, 1):
    print("カウント:", i)
`;

export function MonacoWorkbench() {
  const [code, setCode]           = useState(INITIAL_CODE);
  const [output, setOutput]       = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSample, setSelectedSample] = useState("");
  const [deviceState, setDeviceState] = useState<DeviceState>(DEFAULT_DEVICE_STATE);
  const [showNumericHint, setShowNumericHint] = useState(false);

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const abortRef  = useRef<{ aborted: boolean }>({ aborted: false });

  // ─── Monaco setup ──────────────────────────────────────────────────────

  function handleEditorMount(ed: editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current  = ed;
    monacoRef.current  = monaco;

    // Ctrl+Enter to run
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isRunning) void handleRun();
    });

    // Define custom info1 language for basic syntax highlighting
    monaco.languages.register({ id: "info1" });
    monaco.languages.setMonarchTokensProvider("info1", {
      keywords: ["if", "elif", "else", "for", "in", "while", "def", "return",
                 "break", "continue", "pass", "and", "or", "not"],
      typeKeywords: ["True", "False", "None"],
      tokenizer: {
        root: [
          [/#.*$/, "comment"],
          [/"([^"\\]|\\.)*$/, "string.invalid"],
          [/"/, "string", "@string_dq"],
          [/'([^'\\]|\\.)*$/, "string.invalid"],
          [/'/, "string", "@string_sq"],
          [/\d+\.\d*/, "number.float"],
          [/\d+/, "number"],
          [/[a-zA-Z_]\w*/, {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "keyword.type",
              "@default": "identifier",
            },
          }],
          [/[+\-*/%=<>!]+/, "operator"],
          [/[()[\],:]/, "delimiter"],
        ],
        string_dq: [
          [/[^\\"]+/, "string"],
          [/\\./, "string.escape"],
          [/"/, "string", "@pop"],
        ],
        string_sq: [
          [/[^\\']+/, "string"],
          [/\\./, "string.escape"],
          [/'/, "string", "@pop"],
        ],
      },
    });
  }

  // ─── Run / Stop ────────────────────────────────────────────────────────

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput([]);
    setShowNumericHint(false);
    abortRef.current = { aborted: false };

    const monaco = monacoRef.current;
    const ed     = editorRef.current;

    // Clear previous markers
    if (monaco && ed) {
      monaco.editor.setModelMarkers(ed.getModel()!, "info1", []);
    }

    const io = new IOBuffer();
    const lines: OutputLine[] = [];
    io.onLine((l) => {
      lines.push(l);
      setOutput([...lines]);
    });

    try {
      const currentCode = editorRef.current?.getValue() ?? code;
      const program = parse(currentCode);
      const evaluator = new Evaluator(io, {
        deviceCtx: {
          getState: () => deviceState,
          setState: setDeviceState,
        },
        useMockApi: false,
      });
      await evaluator.run(program);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      io.stderr(msg);
      setOutput([...lines]);

      // Show inline error marker in Monaco
      if (monaco && ed && (err instanceof ParseError || err instanceof TokenizeError)) {
        const e = err as ParseError;
        monaco.editor.setModelMarkers(ed.getModel()!, "info1", [{
          severity: monaco.MarkerSeverity.Error,
          message: e.message,
          startLineNumber: e.line,
          startColumn: e.col,
          endLineNumber: e.line,
          endColumn: e.col + 10,
        }]);
      }
    } finally {
      setIsRunning(false);
    }

    // Show numeric hint if floating-point sample was run
    if (selectedSample === "floating-point-error") {
      setShowNumericHint(true);
    }
  }, [code, isRunning, deviceState, selectedSample]);

  // Stop handler (sets abort flag — evaluator checks on each step in future)
  const handleStop = useCallback(() => {
    abortRef.current.aborted = true;
    setIsRunning(false);
  }, []);

  const handleReset = useCallback(() => {
    setOutput([]);
    setShowNumericHint(false);
    if (monacoRef.current && editorRef.current) {
      monacoRef.current.editor.setModelMarkers(
        editorRef.current.getModel()!, "info1", [],
      );
    }
  }, []);

  // ─── Sample loading ────────────────────────────────────────────────────

  const handleSampleChange = useCallback((value: string) => {
    setSelectedSample(value);
    if (!value) return;
    const sample = SAMPLES.find((s: SampleEntry) => s.id === value);
    if (sample) {
      setCode(sample.code);
      editorRef.current?.setValue(sample.code);
      setOutput([]);
    }
  }, []);

  // Keyboard shortcut: Ctrl+Enter when editor is focused
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!isRunning) void handleRun();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, handleRun]);

  const sampleOptions = SAMPLES.map((s: SampleEntry) => ({ label: s.label, value: s.id }));

  return (
    <div className="workbench">
      <Toolbar
        isRunning={isRunning}
        samples={sampleOptions}
        selectedSample={selectedSample}
        onRun={handleRun}
        onStop={handleStop}
        onReset={handleReset}
        onSampleChange={handleSampleChange}
      />

      <div className="workbench-main">
        {/* Editor pane */}
        <div className="editor-pane">
          <div className="pane-label">エディタ</div>
          <Editor
            height="100%"
            defaultLanguage="info1"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              lineNumbers: "on",
              tabSize: 4,
              insertSpaces: true,
              renderWhitespace: "boundary",
              fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
            }}
          />
        </div>

        {/* Output pane */}
        <div className="output-pane">
          <ConsolePanel lines={output} />
          <DevicePanel state={deviceState} onChange={setDeviceState} />
          <NumericHintPanel visible={showNumericHint} />
        </div>
      </div>
    </div>
  );
}
