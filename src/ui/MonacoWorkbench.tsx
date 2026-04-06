import { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

interface Props {
  code: string;
  onChange: (code: string) => void;
  errorLine?: number;
  onEditorMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
}

const EDITOR_OPTIONS: Monaco.editor.IStandaloneEditorConstructionOptions = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Menlo', 'Consolas', monospace",
  lineHeight: 22,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 4,
  insertSpaces: true,
  wordWrap: 'on',
  renderLineHighlight: 'line',
  theme: 'vs-dark',
};

export function MonacoWorkbench({ code, onChange, errorLine, onEditorMount }: Props) {
  const monacoRef = useRef<typeof Monaco | null>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount = (
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    onEditorMount?.(editor);
  };

  // Update error marker whenever errorLine changes
  const handleValidation = () => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;

    if (errorLine != null) {
      monaco.editor.setModelMarkers(model, 'info1', [{
        startLineNumber: errorLine,
        endLineNumber: errorLine,
        startColumn: 1,
        endColumn: model.getLineMaxColumn(errorLine),
        message: 'エラーがあります',
        severity: monaco.MarkerSeverity.Error,
      }]);
    } else {
      monaco.editor.setModelMarkers(model, 'info1', []);
    }
  };

  // Run handleValidation effect whenever errorLine changes
  // We do it via onMount + update logic in parent; markers are set here on change
  const handleChange = (value: string | undefined) => {
    onChange(value ?? '');
  };

  // Expose marker update to parent via a ref callback pattern
  // Simpler: just re-set markers on every render when errorLine is defined
  // We use a useEffect-like approach via the editor's onDidChangeModel
  const setMarkers = () => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!monaco || !editor) return;
    const model = editor.getModel();
    if (!model) return;
    if (errorLine != null) {
      monaco.editor.setModelMarkers(model, 'info1', [{
        startLineNumber: errorLine,
        endLineNumber: errorLine,
        startColumn: 1,
        endColumn: model.getLineMaxColumn(Math.min(errorLine, model.getLineCount())),
        message: 'エラーがあります',
        severity: monaco.MarkerSeverity.Error,
      }]);
    } else {
      monaco.editor.setModelMarkers(model, 'info1', []);
    }
  };

  // Call setMarkers on each render (safe: Monaco handles idempotency)
  setMarkers();

  return (
    <div className="editor-pane">
      <MonacoEditor
        height="100%"
        language="python"
        value={code}
        options={EDITOR_OPTIONS}
        onMount={handleMount}
        onChange={handleChange}
        onValidate={handleValidation}
      />
    </div>
  );
}
