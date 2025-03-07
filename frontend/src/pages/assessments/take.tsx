import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProctoringSystem, { ProctoringViolation } from '@/components/proctoring/ProctoringSystem';
import { FaClipboardCheck, FaExclamationTriangle } from 'react-icons/fa';
import assessmentsService from '@/services/assessmentsService';
import { useToast } from '@chakra-ui/react';

const TakeAssessmentPage = () => {
  const router = useRouter();
  const { id: assessmentId } = router.query;
  const toast = useToast();
  
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [proctoringStarted, setProctoringStarted] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  
  // Initialize socket connection
  useEffect(() => {
    // Only initialize socket if proctoring is enabled
    if (proctoringEnabled) {
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', {
        path: '/ws/socket.io',
        transports: ['websocket']
      });
      
      setSocket(socketInstance);
      
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [proctoringEnabled]);
  
  // Fetch assessment data
  useEffect(() => {
    if (!assessmentId || !socket) return;
    
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from an API
        const data = await assessmentsService.getAssessmentById(assessmentId as string);
        setAssessment(data);
        
        // Set initial time remaining
        if (data.timeLimit) {
          setTimeRemaining(data.timeLimit * 60); // Convert minutes to seconds
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load assessment. Please try again.');
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [assessmentId, socket]);
  
  // Timer countdown
  useEffect(() => {
    if (!timeRemaining || !proctoringStarted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev > 0) {
          return prev - 1;
        } else {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, proctoringStarted]);
  
  // Format time remaining
  const formatTimeRemaining = () => {
    if (!timeRemaining) return '--:--';
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    if (currentQuestion < (assessment?.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };
  
  // Handle previous question
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  // Handle proctoring violation
  const handleViolation = (violation: ProctoringViolation) => {
    setViolations(prev => [...prev, violation]);
    
    // Show toast for violations
    const toastStatus = 
      violation.severity === 'high' ? 'error' : 
      violation.severity === 'medium' ? 'warning' : 'info';
    
    toast({
      title: 'Proctoring Alert',
      description: violation.details,
      status: toastStatus,
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Handle assessment termination due to violations
  const handleTerminate = () => {
    toast({
      title: 'Assessment Terminated',
      description: 'Multiple serious violations detected. Your assessment has been terminated.',
      status: 'error',
      duration: null,
      isClosable: true,
    });
    
    // In a real app, this would notify the server and redirect
    setTimeout(() => {
      router.push('/dashboard');
    }, 5000);
  };
  
  // Handle submit assessment
  const handleSubmitAssessment = async () => {
    try {
      // In a real app, this would submit to an API
      await assessmentsService.submitAssessment(assessmentId as string, answers);
      
      toast({
        title: 'Assessment Submitted',
        description: 'Your assessment has been submitted successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to results or dashboard
      router.push('/dashboard');
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your assessment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Render current question
  const renderQuestion = () => {
    if (!assessment || !assessment.questions || assessment.questions.length === 0) {
      return <p>No questions available.</p>;
    }
    
    const question = assessment.questions[currentQuestion];
    
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Question {currentQuestion + 1} of {assessment.questions.length}
          </span>
          <h3 className="text-lg font-medium text-gray-900 mt-2">{question.text}</h3>
          {question.codeSnippet && (
            <div className="mt-3 bg-gray-800 text-white p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">{question.codeSnippet}</pre>
            </div>
          )}
        </div>
        
        {question.type === 'multiple_choice' && (
          <div className="space-y-3">
            {question.options.map((option: any, index: number) => (
              <div key={index} className="flex items-center">
                <input
                  id={`option-${index}`}
                  name={`question-${question.id}`}
                  type="radio"
                  checked={answers[question.id] === option.id}
                  onChange={() => handleAnswerChange(question.id, option.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`option-${index}`} className="ml-3 block text-sm font-medium text-gray-700">
                  {option.text}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {question.type === 'coding' && (
          <div className="mt-4">
            <textarea
              rows={10}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Write your code here..."
            />
          </div>
        )}
        
        {question.type === 'text' && (
          <div className="mt-4">
            <textarea
              rows={5}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Write your answer here..."
            />
          </div>
        )}
      </div>
    );
  };
  
  // If proctoring is not started yet, show the proctoring setup
  if (!proctoringStarted && proctoringEnabled && socket) {
    return (
      <DashboardLayout
        title="Take Assessment"
        icon={<FaClipboardCheck className="text-blue-600" />}
        description={assessment?.title || 'Loading assessment...'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProctoringSystem
            assessmentId={assessmentId as string}
            candidateId="current-user-id" // In a real app, this would be the actual user ID
            socket={socket}
            onViolation={handleViolation}
            onTerminate={handleTerminate}
          />
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setProctoringEnabled(false);
                setProctoringStarted(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue Without Proctoring (Demo Only)
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout
      title="Take Assessment"
      icon={<FaClipboardCheck className="text-blue-600" />}
      description={assessment?.title || 'Loading assessment...'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Timer and progress */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">Progress:</span>
                <div className="ml-2 w-64 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${(currentQuestion + 1) / assessment?.questions?.length * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  {currentQuestion + 1} of {assessment?.questions?.length}
                </span>
              </div>
              
              {timeRemaining !== null && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">Time Remaining:</span>
                  <span className={`font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-800'}`}>
                    {formatTimeRemaining()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Question content */}
            {renderQuestion()}
            
            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
                className={`px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                  currentQuestion === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                Previous
              </button>
              
              {currentQuestion < (assessment?.questions?.length || 0) - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitAssessment}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Assessment
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TakeAssessmentPage; 