import Editor from '@monaco-editor/react';

interface Props {
  code: string;
  onChange: (code: string) => void;
  height?: string;
}

export function MonacoWorkbench({ code, onChange, height = '400px' }: Props) {
  return (
    <Editor
      height={height}
      defaultLanguage="python"
      value={code}
      onChange={v => onChange(v ?? '')}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
      }}
    />
  );
}
