import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { FaPlay, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  readOnly?: boolean;
  onSubmit?: (code: string) => Promise<any>;
  testCases?: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
}

interface ExecutionResult {
  status: 'idle' | 'running' | 'success' | 'error';
  output?: string;
  error?: string;
  testResults?: {
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput: string;
  }[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialCode = '// Write your code here',
  language = 'javascript',
  readOnly = false,
  onSubmit,
  testCases = [],
}) => {
  const [code, setCode] = useState(initialCode);
  const [execution, setExecution] = useState<ExecutionResult>({
    status: 'idle',
  });
  const [theme, setTheme] = useState('vs-dark');

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleRunCode = async () => {
    if (!onSubmit) return;

    setExecution({
      status: 'running',
    });

    try {
      const result = await onSubmit(code);
      
      // Process test results if available
      const testResults = testCases.map((testCase) => {
        const testResult = result.testResults?.find((tr: any) => tr.testCaseId === testCase.id);
        return {
          passed: testResult?.passed || false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: testResult?.output || '',
        };
      });

      setExecution({
        status: result.error ? 'error' : 'success',
        output: result.stdout,
        error: result.error || result.stderr,
        testResults,
      });
    } catch (error) {
      setExecution({
        status: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-gray-800 text-white">
        <div className="flex items-center space-x-2">
          <select
            value={language}
            disabled
            className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button
            onClick={toggleTheme}
            className="bg-gray-700 px-2 py-1 rounded text-sm"
          >
            {theme === 'vs-dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        {!readOnly && onSubmit && (
          <button
            onClick={handleRunCode}
            disabled={execution.status === 'running'}
            className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded text-sm transition-colors"
          >
            {execution.status === 'running' ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <FaPlay />
                <span>Run Code</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex-grow">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={theme}
          onChange={handleEditorChange}
          options={{
            readOnly,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'Fira Code, monospace',
            tabSize: 2,
          }}
        />
      </div>

      {(execution.output || execution.error || execution.testResults) && (
        <div className="border-t border-gray-700 bg-gray-800 text-white">
          <div className="flex border-b border-gray-700">
            <button
              className={`px-4 py-2 text-sm ${
                !execution.testResults?.length ? 'border-b-2 border-primary-500' : ''
              }`}
            >
              Output
            </button>
            {execution.testResults?.length > 0 && (
              <button
                className="px-4 py-2 text-sm border-b-2 border-primary-500"
              >
                Test Cases
              </button>
            )}
          </div>

          <div className="p-4 max-h-40 overflow-auto font-mono text-sm">
            {execution.error ? (
              <div className="text-danger-400">{execution.error}</div>
            ) : execution.testResults?.length ? (
              <div className="space-y-2">
                {execution.testResults.map((result, index) => (
                  <div key={index} className="border border-gray-700 rounded p-2">
                    <div className="flex items-center space-x-2">
                      {result.passed ? (
                        <FaCheck className="text-success-500" />
                      ) : (
                        <FaTimes className="text-danger-500" />
                      )}
                      <span className={result.passed ? 'text-success-500' : 'text-danger-500'}>
                        Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs">
                      <div>
                        <span className="text-gray-400">Input:</span> {result.input}
                      </div>
                      <div>
                        <span className="text-gray-400">Expected:</span> {result.expectedOutput}
                      </div>
                      {!result.passed && (
                        <div>
                          <span className="text-gray-400">Actual:</span> {result.actualOutput}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : execution.output ? (
              <pre>{execution.output}</pre>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor; 