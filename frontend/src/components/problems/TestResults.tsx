import { CheckCircle2, XCircle } from 'lucide-react';

interface TestResultsProps {
  results: {
    passed: number;
    total: number;
    results: Array<{
      input: string;
      expected: string;
      actual: string;
      passed: boolean;
    }>;
  };
}

export default function TestResults({ results }: TestResultsProps) {
  return (
    <div className="bg-gray-900 border-t border-gray-800 max-h-64 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Test Results</h3>
          <span className={`text-sm font-semibold ${
            results.passed === results.total ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {results.passed}/{results.total} Passed
          </span>
        </div>

        <div className="space-y-2">
          {results.results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                result.passed
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/5 border-red-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Test Case {index + 1}</span>
                {result.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="space-y-1 text-xs font-mono">
                <p className="text-gray-300">
                  <span className="text-gray-500">Input:</span> {result.input}
                </p>
                <p className="text-gray-300">
                  <span className="text-gray-500">Expected:</span> {result.expected}
                </p>
                <p className={result.passed ? 'text-green-400' : 'text-red-400'}>
                  <span className="text-gray-500">Actual:</span> {result.actual}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
