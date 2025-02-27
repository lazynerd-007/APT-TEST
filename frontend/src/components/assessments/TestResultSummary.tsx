import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaChartBar, FaCode, FaList, FaFileAlt } from 'react-icons/fa';

interface QuestionResult {
  id: string;
  content: string;
  type: 'mcq' | 'coding' | 'essay' | 'file_upload';
  points: number;
  earnedPoints: number;
  timeSpent: number; // in seconds
  answer?: any;
  correctAnswer?: any;
  feedback?: string;
  codeExecutionResults?: {
    status: 'success' | 'error';
    testResults?: Array<{
      testCaseId: string;
      input: string;
      expectedOutput: string;
      output?: string;
      passed: boolean;
    }>;
    error?: string;
  };
}

interface SkillScore {
  id: string;
  name: string;
  category: string;
  score: number; // 0-100
}

interface TestResultSummaryProps {
  assessmentId: string;
  assessmentTitle: string;
  completedAt: string;
  timeSpent: number; // in minutes
  totalScore: number;
  passingScore: number;
  status: 'passed' | 'failed';
  questionResults: QuestionResult[];
  skillScores: SkillScore[];
  strengths: string[];
  weaknesses: string[];
  feedback?: string;
  onRetake?: () => void;
  onViewDetails?: (questionId: string) => void;
}

const TestResultSummary: React.FC<TestResultSummaryProps> = ({
  assessmentId,
  assessmentTitle,
  completedAt,
  timeSpent,
  totalScore,
  passingScore,
  status,
  questionResults,
  skillScores,
  strengths,
  weaknesses,
  feedback,
  onRetake,
  onViewDetails,
}) => {
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'mcq':
        return <FaList className="text-gray-500" />;
      case 'coding':
        return <FaCode className="text-gray-500" />;
      case 'essay':
        return <FaFileAlt className="text-gray-500" />;
      case 'file_upload':
        return <FaFileAlt className="text-gray-500" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{assessmentTitle}</h1>
            <p className="text-gray-500 mt-1">Completed on {completedAt}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <div className={`flex items-center px-4 py-2 rounded-full ${
              status === 'passed'
                ? 'bg-success-100 text-success-800'
                : 'bg-danger-100 text-danger-800'
            }`}>
              {status === 'passed' ? (
                <FaCheckCircle className="mr-2" />
              ) : (
                <FaTimesCircle className="mr-2" />
              )}
              <span className="font-medium">
                {status === 'passed' ? 'Passed' : 'Failed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Score */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary-600">{totalScore}%</div>
              <div className="text-sm text-gray-500 mt-1">Total Score</div>
              <div className="text-xs text-gray-500 mt-1">
                ({passingScore}% to pass)
              </div>
            </div>

            {/* Time Spent */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-1">
                <FaClock className="text-gray-500" />
              </div>
              <div className="text-3xl font-bold text-gray-700">{timeSpent} min</div>
              <div className="text-sm text-gray-500 mt-1">Time Spent</div>
            </div>

            {/* Questions */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-1">
                <FaChartBar className="text-gray-500" />
              </div>
              <div className="text-3xl font-bold text-gray-700">
                {questionResults.filter(q => q.earnedPoints > 0).length} / {questionResults.length}
              </div>
              <div className="text-sm text-gray-500 mt-1">Questions Correct</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className={`h-full ${status === 'passed' ? 'bg-success-500' : 'bg-danger-500'}`}
            style={{ width: `${totalScore}%` }}
          ></div>
        </div>
      </div>

      {/* Skill Scores */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Skill Breakdown</h2>
        <div className="space-y-4">
          {skillScores.map((skill) => (
            <div key={skill.id}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                <span className="text-sm font-medium text-gray-700">{skill.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    skill.score >= 70 ? 'bg-success-500' : skill.score >= 40 ? 'bg-warning-500' : 'bg-danger-500'
                  }`}
                  style={{ width: `${skill.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{skill.category}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Strengths</h2>
          {strengths.length > 0 ? (
            <ul className="space-y-2">
              {strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <FaCheckCircle className="text-success-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No specific strengths identified.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Areas for Improvement</h2>
          {weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <FaTimesCircle className="text-danger-500 mt-1 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No specific areas for improvement identified.</p>
          )}
        </div>
      </div>

      {/* Question Results */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Question Results</h2>
        <div className="space-y-4">
          {questionResults.map((question, index) => (
            <div
              key={question.id}
              className={`border rounded-lg p-4 ${
                question.earnedPoints === question.points
                  ? 'border-success-200 bg-success-50'
                  : question.earnedPoints > 0
                  ? 'border-warning-200 bg-warning-50'
                  : 'border-danger-200 bg-danger-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <span className="bg-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center mr-2 border">
                    {index + 1}
                  </span>
                  <div className="flex items-center">
                    {getQuestionTypeIcon(question.type)}
                    <span className="ml-2 font-medium text-gray-800">
                      {question.type === 'mcq'
                        ? 'Multiple Choice'
                        : question.type === 'coding'
                        ? 'Coding Challenge'
                        : question.type === 'essay'
                        ? 'Essay Question'
                        : 'File Upload'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-3">
                    <FaClock className="inline mr-1" /> {formatTime(question.timeSpent)}
                  </span>
                  <span className="font-medium">
                    {question.earnedPoints} / {question.points} pts
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-gray-800">{question.content}</p>
              </div>

              {/* Show test results for coding questions */}
              {question.type === 'coding' && question.codeExecutionResults && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Test Results</h4>
                  <div className="space-y-2">
                    {question.codeExecutionResults.testResults?.map((result, idx) => (
                      <div
                        key={idx}
                        className={`text-xs p-2 rounded ${
                          result.passed ? 'bg-success-100' : 'bg-danger-100'
                        }`}
                      >
                        <div className="flex items-center">
                          {result.passed ? (
                            <FaCheckCircle className="text-success-500 mr-1" />
                          ) : (
                            <FaTimesCircle className="text-danger-500 mr-1" />
                          )}
                          <span className={result.passed ? 'text-success-700' : 'text-danger-700'}>
                            Test {idx + 1}: {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.feedback && (
                <div className="mt-3 text-sm bg-gray-100 p-3 rounded">
                  <span className="font-medium">Feedback: </span>
                  {question.feedback}
                </div>
              )}

              {onViewDetails && (
                <div className="mt-3 text-right">
                  <button
                    onClick={() => onViewDetails(question.id)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overall Feedback */}
      {feedback && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Overall Feedback</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{feedback}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {onRetake && (
        <div className="flex justify-center">
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Retake Assessment
          </button>
        </div>
      )}
    </div>
  );
};

export default TestResultSummary; 