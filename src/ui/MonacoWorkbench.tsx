import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

type MonacoWorkbenchProps = {
  code: string;
  onChange: (value: string) => void;
};

export function MonacoWorkbench({ code, onChange }: MonacoWorkbenchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const model = monaco.editor.createModel(code, "python");
    const editor = monaco.editor.create(containerRef.current, {
      model,
      automaticLayout: true,
      minimap: { enabled: false },
      theme: "vs-dark",
      fontSize: 15,
      lineNumbersMinChars: 3,
      padding: { top: 18, bottom: 18 },
      roundedSelection: false,
      scrollBeyondLastLine: false,
    });

    const subscription = model.onDidChangeContent(() => {
      onChange(model.getValue());
    });

    editorRef.current = editor;

    return () => {
      subscription.dispose();
      editor.dispose();
      model.dispose();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    const model = editor.getModel();
    if (!model) {
      return;
    }
    if (model.getValue() !== code) {
      model.setValue(code);
    }
  }, [code]);

  return <div ref={containerRef} className="editor-shell" />;
}
