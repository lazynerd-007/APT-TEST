import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaChartBar, FaDownload } from 'react-icons/fa';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'coding' | 'text';
  correctAnswer?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  explanation?: string;
  points: number;
  earnedPoints?: number;
}

interface AssessmentResult {
  id: string;
  title: string;
  description: string;
  completedAt: string;
  score: number;
  passingScore: number;
  timeSpent: number; // in minutes
  questions: Question[];
  feedback?: string;
}

const AssessmentResultsPage = () => {
  const router = useRouter();
  const { id: assessmentId } = router.query;
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!assessmentId) return;

    // In a real app, fetch results from API
    // For now, use mock data
    const fetchResults = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockResult: AssessmentResult = {
          id: assessmentId as string,
          title: 'JavaScript Fundamentals',
          description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
          completedAt: '2025-03-01T14:30:00Z',
          score: 85,
          passingScore: 70,
          timeSpent: 45, // 45 minutes
          questions: [
            {
              id: 'q1',
              text: 'What is the output of: console.log(typeof null)?',
              type: 'multiple_choice',
              correctAnswer: 'object',
              userAnswer: 'object',
              isCorrect: true,
              explanation: 'In JavaScript, typeof null returns "object", which is considered a bug in the language.',
              points: 10,
              earnedPoints: 10
            },
            {
              id: 'q2',
              text: 'What is the difference between let and var in JavaScript?',
              type: 'text',
              correctAnswer: 'let is block-scoped while var is function-scoped. let does not allow redeclaration within the same scope.',
              userAnswer: 'let is block scoped and var is function scoped.',
              isCorrect: true,
              explanation: 'Your answer covers the key difference regarding scope, but could have mentioned redeclaration constraints.',
              points: 15,
              earnedPoints: 12
            },
            {
              id: 'q3',
              text: 'Write a function that returns the factorial of a number.',
              type: 'coding',
              correctAnswer: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
              userAnswer: 'function factorial(n) {\n  let result = 1;\n  for(let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}',
              isCorrect: true,
              explanation: 'Your iterative solution is correct and efficient. The recursive solution is also valid.',
              points: 25,
              earnedPoints: 25
            },
            {
              id: 'q4',
              text: 'What is the output of: console.log(1 + "2" + "2");',
              type: 'multiple_choice',
              correctAnswer: '"122"',
              userAnswer: '"32"',
              isCorrect: false,
              explanation: 'The expression 1 + "2" + "2" first converts 1 to a string and concatenates with "2", resulting in "12", then concatenates with another "2", resulting in "122".',
              points: 10,
              earnedPoints: 0
            },
            {
              id: 'q5',
              text: 'Explain the concept of closures in JavaScript.',
              type: 'text',
              correctAnswer: 'A closure is a function that has access to its own scope, the scope of the outer function, and the global scope. It allows a function to retain access to variables from its parent scope even after the parent function has finished executing.',
              userAnswer: 'Closures are functions that remember the environment they were created in and can access variables from that environment.',
              isCorrect: true,
              explanation: 'Your answer captures the essence of closures, but could be more detailed about how they retain access to variables after the parent function has completed.',
              points: 20,
              earnedPoints: 15
            }
          ],
          feedback: 'Good understanding of JavaScript fundamentals. Work on understanding type coercion better.'
        };
        
        setResult(mockResult);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assessment results:', error);
        setError('Failed to load assessment results. Please try again.');
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [assessmentId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleDownloadCertificate = () => {
    // In a real app, this would generate and download a certificate
    alert('Certificate download functionality would be implemented here');
  };

  const handleDownloadResults = () => {
    // In a real app, this would generate and download a PDF of results
    alert('Results download functionality would be implemented here');
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Assessment Results"
        icon={<FaClipboardCheck className="text-blue-600" />}
        description="View your assessment results"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout
        title="Assessment Results"
        icon={<FaClipboardCheck className="text-blue-600" />}
        description="View your assessment results"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Results not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalPoints = result.questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = result.questions.reduce((sum, q) => sum + (q.earnedPoints || 0), 0);

  return (
    <DashboardLayout
      title="Assessment Results"
      icon={<FaClipboardCheck className="text-blue-600" />}
      description={`Results for ${result.title}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-medium text-gray-900">{result.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{result.description}</p>
            
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Score</div>
                <div className={`mt-1 text-3xl font-semibold ${result.score >= result.passingScore ? 'text-green-600' : 'text-red-600'}`}>
                  {result.score}%
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {result.score >= result.passingScore ? 'Passed' : 'Failed'} (Passing: {result.passingScore}%)
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Points</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {earnedPoints}/{totalPoints}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {Math.round((earnedPoints / totalPoints) * 100)}% of total points
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Time Spent</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {result.timeSpent} min
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Completed on {formatDate(result.completedAt)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Questions</div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {result.questions.filter(q => q.isCorrect).length}/{result.questions.length}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {Math.round((result.questions.filter(q => q.isCorrect).length / result.questions.length) * 100)}% correct
                </div>
              </div>
            </div>
            
            {result.feedback && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Feedback</h3>
                <p className="mt-1 text-sm text-blue-700">{result.feedback}</p>
              </div>
            )}
            
            <div className="mt-6 flex flex-wrap gap-4">
              {result.score >= result.passingScore && (
                <button
                  onClick={handleDownloadCertificate}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaDownload className="mr-2 -ml-1 h-4 w-4" />
                  Download Certificate
                </button>
              )}
              
              <button
                onClick={handleDownloadResults}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaDownload className="mr-2 -ml-1 h-4 w-4" />
                Download Results
              </button>
            </div>
          </div>
        </div>
        
        {/* Questions and Answers */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Questions and Answers</h3>
            
            <div className="space-y-6">
              {result.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className={`p-4 flex justify-between items-start cursor-pointer ${
                      question.isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 mr-2">Question {index + 1}</span>
                        {question.isCorrect ? (
                          <FaCheckCircle className="text-green-600 h-4 w-4" />
                        ) : (
                          <FaTimesCircle className="text-red-600 h-4 w-4" />
                        )}
                        <span className="ml-2 text-sm font-medium">
                          {question.earnedPoints}/{question.points} points
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">{question.text}</p>
                    </div>
                    <div className="ml-4">
                      <svg 
                        className={`h-5 w-5 text-gray-500 transform ${expandedQuestions[question.id] ? 'rotate-180' : ''}`} 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {expandedQuestions[question.id] && (
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Your Answer:</h4>
                          {question.type === 'coding' ? (
                            <div className="mt-1 bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                              <pre className="text-sm whitespace-pre-wrap">{question.userAnswer}</pre>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{question.userAnswer}</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Correct Answer:</h4>
                          {question.type === 'coding' ? (
                            <div className="mt-1 bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
                              <pre className="text-sm whitespace-pre-wrap">{question.correctAnswer}</pre>
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-gray-900">{question.correctAnswer}</p>
                          )}
                        </div>
                        
                        {question.explanation && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Explanation:</h4>
                            <p className="mt-1 text-sm text-gray-900">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssessmentResultsPage; 