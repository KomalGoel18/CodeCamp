interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
}

export default function CodeEditor({ code, setCode, language }: CodeEditorProps) {
  return (
    <div className="flex-1 bg-gray-900 overflow-hidden flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <span className="text-sm text-gray-400 font-medium">Code Editor</span>
      </div>
      <div className="flex-1 overflow-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-full bg-gray-900 text-gray-100 p-4 font-mono text-sm focus:outline-none resize-none"
          style={{
            minHeight: '400px',
            tabSize: 2,
          }}
          spellCheck={false}
          placeholder={`// Write your ${language} code here...`}
        />
      </div>
    </div>
  );
}
