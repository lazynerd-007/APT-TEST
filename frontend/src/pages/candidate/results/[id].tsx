import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaExclamationCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import assessmentsService from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import { authService } from '@/services/authService';

// Simple layout for candidate pages (same as in the test page)
const CandidateLayout = ({ children, user }) => {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/candidate/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Assessment Platform - Results</title>
      </Head>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Assessment Platform</h1>
          {user && (
            <div className="flex items-center">
              <div className="mr-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FaUser className="mr-1" />
                  {user.firstName}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

const CandidateResultsPage = () => {
  const router = useRouter();
  const { id } = router.query; // This is the candidate_test ID
  const [candidateTest, setCandidateTest] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in using authService
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/candidate/login');
      return;
    }
    
    setUser(currentUser);
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use mock data instead of actual API calls
      
      // Mock test data
      const mockTest = {
        id: id,
        title: 'React Fundamentals',
        description: 'Test your knowledge of React fundamentals',
        instructions: 'Answer all questions to the best of your ability.',
        time_limit: 60, // 60 minutes
        category: 'Frontend',
        difficulty: 'Intermediate',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      };
      
      // Mock candidate test data
      const mockCandidateTest = {
        id: id,
        test: mockTest.id,
        test_details: mockTest,
        status: 'completed',
        score: 75,
        start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        end_time: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      };
      
      // Mock questions data
      const mockQuestions = [
        {
          id: 'q1',
          test: mockTest.id,
          content: 'What is React?',
          question_type: 'mcq',
          points: 5,
          order: 1,
          answers: [
            { id: 'a1', content: 'A JavaScript library for building user interfaces', is_correct: true },
            { id: 'a2', content: 'A programming language', is_correct: false },
            { id: 'a3', content: 'A database management system', is_correct: false },
            { id: 'a4', content: 'A server-side framework', is_correct: false },
          ]
        },
        {
          id: 'q2',
          test: mockTest.id,
          content: 'What is JSX?',
          question_type: 'mcq',
          points: 5,
          order: 2,
          answers: [
            { id: 'a5', content: 'A syntax extension to JavaScript', is_correct: true },
            { id: 'a6', content: 'A new programming language', is_correct: false },
            { id: 'a7', content: 'A database query language', is_correct: false },
            { id: 'a8', content: 'A CSS framework', is_correct: false },
          ]
        },
        {
          id: 'q3',
          test: mockTest.id,
          content: 'Write a function that returns the sum of two numbers.',
          question_type: 'coding',
          points: 10,
          order: 3,
        },
        {
          id: 'q4',
          test: mockTest.id,
          content: 'Explain the concept of virtual DOM in React and why it is important.',
          question_type: 'essay',
          points: 8,
          order: 4,
        },
        {
          id: 'q5',
          test: mockTest.id,
          content: 'Upload a file containing your solution to the following problem: Create a simple React component that displays a counter with increment and decrement buttons.',
          question_type: 'file_upload',
          points: 15,
          order: 5,
        }
      ];
      
      setCandidateTest(mockCandidateTest);
      setTest(mockTest);
      setQuestions(mockQuestions);
      
      // Mock answers data
      const mockAnswers = [
        {
          id: 'ans1',
          question_id: 'q1',
          content: 'a1', // ID of the selected answer
          is_correct: true,
          score: 5,
          feedback: 'Correct! React is indeed a JavaScript library for building user interfaces.'
        },
        {
          id: 'ans2',
          question_id: 'q2',
          content: 'a6', // ID of the selected answer (wrong)
          is_correct: false,
          score: 0,
          feedback: 'Incorrect. JSX is a syntax extension to JavaScript, not a new programming language.'
        },
        {
          id: 'ans3',
          question_id: 'q3',
          content: 'function sum(a, b) {\n  return a + b;\n}',
          is_correct: true,
          score: 10,
          feedback: 'Good job! Your function correctly returns the sum of two numbers.'
        },
        {
          id: 'ans4',
          question_id: 'q4',
          content: 'The Virtual DOM is a concept in React that acts as a lightweight copy of the actual DOM. When state changes in a React component, React first updates the Virtual DOM, then compares it with the previous version (diffing), and finally updates only the necessary parts of the real DOM. This process is more efficient than directly manipulating the DOM for every small change, which would be more expensive in terms of performance.',
          is_correct: true,
          score: 6,
          feedback: 'Good explanation, but you could have elaborated more on the performance benefits.'
        },
        {
          id: 'ans5',
          question_id: 'q5',
          content: 'counter-component.zip',
          is_correct: true,
          score: 12,
          feedback: 'Your solution works correctly, but there are some improvements that could be made to the code structure.'
        }
      ];
      
      setAnswers(mockAnswers);
    } catch (error) {
      console.error('Error fetching results data:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeBadge = (type) => {
    const types = {
      mcq: { label: 'Multiple Choice', color: 'bg-blue-100 text-blue-800' },
      coding: { label: 'Coding', color: 'bg-purple-100 text-purple-800' },
      essay: { label: 'Theory/Essay', color: 'bg-green-100 text-green-800' },
      file_upload: { label: 'File Upload', color: 'bg-orange-100 text-orange-800' },
    };

    const questionType = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={`${questionType.color} capitalize`}>
        {questionType.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const calculateTotalScore = () => {
    if (!answers.length) return 0;
    return answers.reduce((total, answer) => total + (answer.score || 0), 0);
  };

  const calculateMaxScore = () => {
    if (!questions.length) return 0;
    return questions.reduce((total, question) => total + (question.points || 0), 0);
  };

  const getScorePercentage = () => {
    const totalScore = calculateTotalScore();
    const maxScore = calculateMaxScore();
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  const getScoreColor = () => {
    const percentage = getScorePercentage();
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAnswerForQuestion = (questionId) => {
    return answers.find(answer => answer.question_id === questionId) || null;
  };

  if (loading) {
    return (
      <CandidateLayout user={user}>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </CandidateLayout>
    );
  }

  if (!candidateTest || !test) {
    return (
      <CandidateLayout user={user}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Results not found</h3>
            <p className="text-gray-500 mb-4">
              The test results you are looking for do not exist or have been deleted.
            </p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout user={user}>
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{test.title} - Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <div className="flex items-center mt-1">
                  {candidateTest.status === 'completed' ? (
                    <Badge className="bg-green-100 text-green-800 capitalize">Completed</Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 capitalize">{candidateTest.status.replace('_', ' ')}</Badge>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">Start Time:</span>
                <p className="text-gray-900">{formatDate(candidateTest.start_time)}</p>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-500">End Time:</span>
                <p className="text-gray-900">{formatDate(candidateTest.end_time)}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2 flex items-center justify-center">
                  <span className={getScoreColor()}>{calculateTotalScore()}</span>
                  <span className="text-gray-500 text-2xl mx-2">/</span>
                  <span className="text-gray-700">{calculateMaxScore()}</span>
                </div>
                <div className={`text-xl font-semibold ${getScoreColor()}`}>
                  {getScorePercentage()}%
                </div>
                <p className="text-gray-500 mt-2">Total Score</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Questions and Answers */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">Question Breakdown</h3>
          
          {questions.map((question, index) => {
            const answer = getAnswerForQuestion(question.id);
            
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-soft p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">
                      Question {index + 1}: {question.title || question.content.substring(0, 50)}...
                    </h4>
                    <div className="flex items-center mt-1 space-x-2">
                      {getQuestionTypeBadge(question.question_type)}
                      <span className="text-sm text-gray-600">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                  </div>
                  
                  {answer && (
                    <div className="flex items-center">
                      {answer.is_correct ? (
                        <div className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" />
                          <span>{answer.score} / {question.points}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <FaTimesCircle className="mr-1" />
                          <span>{answer.score} / {question.points}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-line">{question.content}</p>
                </div>
                
                {answer && (
                  <div className="mt-4">
                    <h5 className="font-medium text-gray-700 mb-2">Your Answer:</h5>
                    
                    {question.question_type === 'mcq' && question.answers && (
                      <div className="space-y-2">
                        {question.answers.map((option) => {
                          const isSelected = answer.content === option.id;
                          const isCorrect = option.is_correct;
                          
                          let bgColor = 'bg-white';
                          let textColor = 'text-gray-700';
                          let borderColor = 'border-gray-300';
                          let icon = null;
                          
                          if (isSelected && isCorrect) {
                            bgColor = 'bg-green-50';
                            textColor = 'text-green-800';
                            borderColor = 'border-green-500';
                            icon = <FaCheckCircle className="text-green-500 mr-2" />;
                          } else if (isSelected && !isCorrect) {
                            bgColor = 'bg-red-50';
                            textColor = 'text-red-800';
                            borderColor = 'border-red-500';
                            icon = <FaTimesCircle className="text-red-500 mr-2" />;
                          } else if (!isSelected && isCorrect) {
                            bgColor = 'bg-blue-50';
                            textColor = 'text-blue-800';
                            borderColor = 'border-blue-500';
                            icon = <FaExclamationCircle className="text-blue-500 mr-2" />;
                          }
                          
                          return (
                            <div 
                              key={option.id} 
                              className={`flex items-center p-3 border rounded-md ${bgColor} ${textColor} ${borderColor}`}
                            >
                              {icon}
                              <span>{option.content}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {question.question_type !== 'mcq' && (
                      <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                        <p className="whitespace-pre-line">{answer.content}</p>
                      </div>
                    )}
                    
                    {answer.feedback && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-700 mb-2">Feedback:</h5>
                        <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                          <p className="text-gray-800">{answer.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Back Button */}
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/candidate/dashboard')}
            className="flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateResultsPage; 