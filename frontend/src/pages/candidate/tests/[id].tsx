import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaArrowRight, FaClock, FaCheck, FaSave, FaSignOutAlt, FaUser } from 'react-icons/fa';
import assessmentsService from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import authService from '../../../services/authService';

// Simple layout for candidate pages
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
        <title>Assessment Platform</title>
      </Head>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Assessment Platform</h1>
          {user && (
            <div className="flex items-center">
              <div className="mr-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FaUser className="mr-1" />
                  {user.first_name}
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

const CandidateTestPage = () => {
  const router = useRouter();
  const { id } = router.query; // This is the candidate_test ID
  const [candidateTest, setCandidateTest] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/candidate/login');
      return;
    }
    
    setUser(currentUser);
    
    if (id) {
      fetchData();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration purposes
      const mockTest = {
        id: id,
        title: "Demo Programming Test",
        description: "A demo test for programming skills assessment",
        instructions: "Answer all questions to the best of your ability. You can use any programming language for the coding questions.",
        time_limit: 30,
        category: "Programming",
        difficulty: "intermediate",
        is_active: true
      };
      
      const mockCandidateTest = {
        id: id,
        test: mockTest,
        status: "not_started",
        score: null,
        start_time: null,
        end_time: null
      };
      
      const mockQuestions = [
        {
          id: "q1",
          content: "What is the time complexity of a binary search algorithm?",
          type: "mcq",
          difficulty: "medium",
          points: 5,
          answers: [
            { id: "a1", content: "O(1)", is_correct: false },
            { id: "a2", content: "O(log n)", is_correct: true },
            { id: "a3", content: "O(n)", is_correct: false },
            { id: "a4", content: "O(n log n)", is_correct: false }
          ]
        },
        {
          id: "q2",
          content: "Explain the difference between a stack and a queue data structure.",
          type: "essay",
          difficulty: "easy",
          points: 10
        },
        {
          id: "q3",
          content: "Write a function to check if a string is a palindrome.",
          type: "coding",
          difficulty: "medium",
          points: 15
        }
      ];
      
      setTest(mockTest);
      setCandidateTest(mockCandidateTest);
      setQuestions(mockQuestions);
      
      // Comment out the actual API calls for now
      /*
      const [testResponse, candidateTestResponse, questionsResponse] = await Promise.all([
        assessmentsService.getTest(id as string),
        assessmentsService.getCandidateTest(id as string),
        assessmentsService.getQuestions({ test_id: id })
      ]);
      
      setTest(testResponse);
      setCandidateTest(candidateTestResponse);
      setQuestions(questionsResponse);
      */
    } catch (error) {
      console.error("Error fetching test data:", error);
      setError("Failed to load test data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const startTest = async () => {
    try {
      // Mock starting the test
      const now = new Date().toISOString();
      const updatedCandidateTest = {
        ...candidateTest,
        status: 'in_progress',
        start_time: now
      };
      
      setCandidateTest(updatedCandidateTest);
      
      // Initialize the time remaining based on the test time limit
      if (test?.time_limit) {
        setTimeRemaining(test.time_limit * 60); // Convert minutes to seconds
      }
      
      // Initialize answers object
      const initialAnswers = {};
      questions.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
      
      // Comment out the actual API call for now
      /*
      const response = await assessmentsService.startCandidateTest(id as string);
      setCandidateTest(response);
      */
      
      toast.success('Test started successfully!');
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test. Please try again.');
    }
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTestSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '--:--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Save the answer to the backend
    saveAnswer(questionId, value);
  };

  const handleMCQAnswerChange = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        content: answerId,
        submitted: false
      }
    }));
  };

  const saveAnswer = async (questionId: string, answerText: string) => {
    try {
      // Update the answers state
      setAnswers(prev => ({
        ...prev,
        [questionId]: answerText
      }));
      
      // Comment out the actual API call for now
      /*
      await assessmentsService.saveCandidateAnswer(id as string, {
        question_id: questionId,
        answer_text: answerText
      });
      */
      
      // For demo purposes, we'll just show a success message
      toast.success('Answer saved successfully!');
    } catch (error) {
      console.error('Error saving answer:', error);
      toast.error('Failed to save answer. Please try again.');
    }
  };

  const handleTestSubmit = async (isTimeout = false) => {
    if (!confirm('Are you sure you want to submit the test? You cannot make changes after submission.')) {
      return;
    }
    
    try {
      // Mock submitting the test
      const now = new Date().toISOString();
      const updatedCandidateTest = {
        ...candidateTest,
        status: 'completed',
        end_time: now,
        score: 85 // Mock score for demonstration
      };
      
      setCandidateTest(updatedCandidateTest);
      
      // Comment out the actual API call for now
      /*
      const response = await assessmentsService.submitCandidateTest(id as string);
      setCandidateTest(response);
      */
      
      toast.success('Test submitted successfully!');
      router.push('/candidate/dashboard');
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test. Please try again.');
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
            <h3 className="text-lg font-medium text-gray-700 mb-2">Test not found</h3>
            <p className="text-gray-500 mb-4">
              The test you are looking for does not exist or has been deleted.
            </p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  if (!testStarted) {
    return (
      <CandidateLayout user={user}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{test.title}</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-gray-900">{test.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                  <p className="text-gray-900">{test.difficulty || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Time Limit:</span>
                  <p className="text-gray-900">
                    {test.time_limit ? `${test.time_limit} minutes` : 'No time limit'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Questions:</span>
                  <p className="text-gray-900">{questions.length}</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Instructions</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700 whitespace-pre-line">{test.instructions || 'No specific instructions provided.'}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Important:</strong> Once you start the test, the timer will begin. Make sure you have enough time to complete the test before starting.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={startTest}
                size="lg"
                className="px-8"
              >
                Start Test
              </Button>
            </div>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  return (
    <CandidateLayout user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Note: The test feature is not fully implemented yet. This is a preview of the candidate test page.
              </p>
            </div>
          </div>
        </div>

        {/* Header with timer */}
        <div className="bg-white rounded-lg shadow-soft p-4 mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{test.title}</h2>
          {test.time_limit > 0 && (
            <div className={`flex items-center ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-600'}`}>
              <FaClock className="mr-2" />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => {
              let bgColor = 'bg-gray-100 text-gray-700 hover:bg-gray-200';
              
              if (index === currentQuestionIndex) {
                bgColor = 'bg-primary-600 text-white';
              } else if (answers[question.id]?.submitted) {
                bgColor = 'bg-green-500 text-white';
              } else if (answers[question.id]?.content) {
                bgColor = 'bg-blue-100 text-blue-800';
              }
              
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${bgColor}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-800 mr-3">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {getQuestionTypeBadge(currentQuestion.type)}
            </div>
            <div className="text-sm text-gray-600">
              {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-800 whitespace-pre-line">{currentQuestion.content}</p>
          </div>
          
          {/* Answer Section */}
          <div className="mb-6">
            {currentQuestion.question_type === 'mcq' && currentQuestion.answers && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Select the correct answer:</h3>
                {currentQuestion.answers.map((answer) => (
                  <div key={answer.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`answer-${answer.id}`}
                      name={`question-${currentQuestion.id}`}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      checked={currentAnswer.content === answer.id}
                      onChange={() => handleMCQAnswerChange(currentQuestion.id, answer.id)}
                    />
                    <label htmlFor={`answer-${answer.id}`} className="ml-3 text-gray-700">
                      {answer.content}
                    </label>
                  </div>
                ))}
              </div>
            )}
            
            {currentQuestion.question_type === 'coding' && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Write your code:</h3>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-64 font-mono text-sm"
                  placeholder="Write your code here..."
                  value={currentAnswer.content || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                ></textarea>
              </div>
            )}
            
            {currentQuestion.question_type === 'essay' && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Your answer:</h3>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-64"
                  placeholder="Type your answer here..."
                  value={currentAnswer.content || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                ></textarea>
              </div>
            )}
            
            {currentQuestion.question_type === 'file_upload' && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Upload your file:</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAnswerChange(currentQuestion.id, e.target.files[0]);
                      }
                    }}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {currentAnswer.content ? (
                      <div className="flex items-center">
                        <FaCheck className="text-green-500 mr-2" />
                        <span>{typeof currentAnswer.content === 'string' 
                          ? currentAnswer.content 
                          : currentAnswer.content.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <p className="text-gray-700 font-medium mt-2">Click to upload or drag and drop</p>
                        <p className="text-gray-500 text-sm mt-1">Supported file types: PDF, DOC, DOCX, ZIP</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {/* Save Answer Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => saveAnswer(currentQuestion.id, currentAnswer.content)}
              disabled={!currentAnswer.content && currentAnswer.content !== 0}
              className="flex items-center"
            >
              <FaSave className="mr-2" />
              Save Answer
            </Button>
          </div>
        </div>
        
        {/* Navigation and Submit Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Previous
          </Button>
          
          <Button
            variant="danger"
            onClick={() => handleTestSubmit()}
            disabled={submitting}
            isLoading={submitting}
            className="flex items-center"
          >
            Submit Test
          </Button>
          
          <Button
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center"
          >
            Next
            <FaArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </CandidateLayout>
  );
};

export default CandidateTestPage; 