import React, { useState, useEffect } from 'react';
import { FaClock, FaChevronLeft, FaChevronRight, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import CodeEditor from '../CodeEditor';

interface Question {
  id: string;
  content: string;
  type: 'mcq' | 'coding' | 'essay' | 'file_upload';
  answers?: Array<{
    id: string;
    content: string;
  }>;
  testCases?: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
}

interface CandidateTestProps {
  assessmentId: string;
  assessmentTitle: string;
  timeLimit: number; // in minutes
  questions: Question[];
  onSubmitAnswer: (questionId: string, answer: any) => Promise<void>;
  onCompleteTest: () => Promise<void>;
  onTimeExpired: () => void;
}

const CandidateTest: React.FC<CandidateTestProps> = ({
  assessmentId,
  assessmentTitle,
  timeLimit,
  questions,
  onSubmitAnswer,
  onCompleteTest,
  onTimeExpired,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Record<string, any>>({});

  // Initialize answers
  useEffect(() => {
    const initialAnswers: Record<string, any> = {};
    questions.forEach((question) => {
      if (question.type === 'mcq') {
        initialAnswers[question.id] = [];
      } else if (question.type === 'coding') {
        initialAnswers[question.id] = question.content || '// Write your code here';
      } else if (question.type === 'essay') {
        initialAnswers[question.id] = '';
      } else if (question.type === 'file_upload') {
        initialAnswers[question.id] = null;
      }
    });
    setAnswers(initialAnswers);
  }, [questions]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeExpired]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleNextQuestion = async () => {
    // Save current answer
    await saveCurrentAnswer();
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = async () => {
    // Save current answer
    await saveCurrentAnswer();
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const saveCurrentAnswer = async () => {
    const questionId = currentQuestion.id;
    const answer = answers[questionId];
    
    if (answer) {
      setIsSubmitting(true);
      try {
        await onSubmitAnswer(questionId, answer);
      } catch (error) {
        console.error('Error saving answer:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCompleteTest = async () => {
    // Save current answer first
    await saveCurrentAnswer();
    
    setIsSubmitting(true);
    try {
      await onCompleteTest();
    } catch (error) {
      console.error('Error completing test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMCQAnswerChange = (answerId: string) => {
    const questionId = currentQuestion.id;
    const currentAnswers = [...(answers[questionId] || [])];
    
    // Toggle answer selection
    if (currentAnswers.includes(answerId)) {
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter((id) => id !== answerId),
      });
    } else {
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, answerId],
      });
    }
  };

  const handleEssayChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const questionId = currentQuestion.id;
    setAnswers({
      ...answers,
      [questionId]: event.target.value,
    });
  };

  const handleCodeChange = (code: string) => {
    const questionId = currentQuestion.id;
    setAnswers({
      ...answers,
      [questionId]: code,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const questionId = currentQuestion.id;
    const file = event.target.files?.[0] || null;
    setAnswers({
      ...answers,
      [questionId]: file,
    });
  };

  const handleRunCode = async (code: string) => {
    const questionId = currentQuestion.id;
    setIsSubmitting(true);
    
    try {
      // This would be replaced with an actual API call to execute code
      const result = await new Promise<any>((resolve) => {
        setTimeout(() => {
          const testResults = currentQuestion.testCases?.map((testCase) => {
            // Simulate test execution (in a real app, this would be done on the server)
            const passed = Math.random() > 0.3; // Randomly pass or fail for demo
            return {
              testCaseId: testCase.id,
              passed,
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              output: passed ? testCase.expectedOutput : 'Incorrect output',
            };
          });
          
          resolve({
            status: 'success',
            stdout: 'Code executed successfully',
            testResults,
          });
        }, 1000);
      });
      
      setExecutionResults({
        ...executionResults,
        [questionId]: result,
      });
      
      return result;
    } catch (error) {
      console.error('Error running code:', error);
      return {
        status: 'error',
        error: 'Failed to execute code',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{assessmentTitle}</h1>
          <p className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            timeRemaining < 300 ? 'bg-danger-100 text-danger-700' : 'bg-gray-100 text-gray-700'
          }`}>
            <FaClock className={timeRemaining < 300 ? 'animate-pulse' : ''} />
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-primary-500"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Main content */}
      <div className="flex-grow overflow-auto p-6">
        {currentQuestion && (
          <div className="max-w-4xl mx-auto">
            {/* Question content */}
            <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="prose max-w-none mb-6">
                {currentQuestion.type !== 'coding' && <p>{currentQuestion.content}</p>}
              </div>

              {/* Answer input based on question type */}
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQuestion.answers?.map((answer) => (
                    <label
                      key={answer.id}
                      className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id]?.includes(answer.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        checked={answers[currentQuestion.id]?.includes(answer.id) || false}
                        onChange={() => handleMCQAnswerChange(answer.id)}
                      />
                      <span className="ml-3">{answer.content}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'essay' && (
                <div>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Type your answer here..."
                    value={answers[currentQuestion.id] || ''}
                    onChange={handleEssayChange}
                  ></textarea>
                </div>
              )}

              {currentQuestion.type === 'coding' && (
                <div className="h-96 border border-gray-300 rounded-md overflow-hidden">
                  <CodeEditor
                    initialCode={answers[currentQuestion.id] || '// Write your code here'}
                    language="javascript"
                    onSubmit={handleRunCode}
                    testCases={currentQuestion.testCases?.filter(tc => !tc.isHidden)}
                  />
                </div>
              )}

              {currentQuestion.type === 'file_upload' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Choose File
                  </label>
                  <p className="mt-2 text-sm text-gray-500">
                    {answers[currentQuestion.id]
                      ? `Selected: ${answers[currentQuestion.id].name}`
                      : 'Upload your file here'}
                  </p>
                </div>
              )}
            </div>

            {/* Test cases results for coding questions */}
            {currentQuestion.type === 'coding' && executionResults[currentQuestion.id] && (
              <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
                <h3 className="text-md font-semibold text-gray-800 mb-3">Test Results</h3>
                <div className="space-y-2">
                  {executionResults[currentQuestion.id].testResults?.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-md ${
                        result.passed ? 'border-success-200 bg-success-50' : 'border-danger-200 bg-danger-50'
                      }`}
                    >
                      <div className="flex items-center">
                        {result.passed ? (
                          <FaCheck className="text-success-500 mr-2" />
                        ) : (
                          <FaExclamationCircle className="text-danger-500 mr-2" />
                        )}
                        <span className={result.passed ? 'text-success-700' : 'text-danger-700'}>
                          Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>
                          <span className="font-medium">Input:</span> {result.input}
                        </p>
                        <p>
                          <span className="font-medium">Expected:</span> {result.expectedOutput}
                        </p>
                        {!result.passed && (
                          <p>
                            <span className="font-medium">Your Output:</span> {result.output}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation footer */}
      <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center">
        <button
          type="button"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0 || isSubmitting}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
            currentQuestionIndex === 0 || isSubmitting
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FaChevronLeft className="mr-2" /> Previous
        </button>

        <div className="text-sm text-gray-500">
          {currentQuestionIndex + 1} of {questions.length}
        </div>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            Next <FaChevronRight className="ml-2" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCompleteTest}
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-success-600 hover:bg-success-700'
            }`}
          >
            <FaCheck className="mr-2" /> Complete Test
          </button>
        )}
      </div>
    </div>
  );
};

export default CandidateTest; 