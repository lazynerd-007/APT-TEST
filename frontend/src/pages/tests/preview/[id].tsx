import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaArrowRight, FaClock } from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';
import assessmentsService from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';

const TestPreviewPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testData, questionsData] = await Promise.all([
        assessmentsService.getTest(id as string),
        assessmentsService.getQuestions({ test: id }),
      ]);
      
      setTest(testData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching test details:', error);
      toast.error('Failed to load test preview');
      router.push(`/tests/${id}`);
    } finally {
      setLoading(false);
    }
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
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!test) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Test not found</h3>
            <p className="text-gray-500 mb-4">
              The test you are looking for does not exist or has been deleted.
            </p>
            <Button
              onClick={() => router.push('/tests')}
              className="flex items-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Back to Tests
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/tests/${id}`)}
              className="flex items-center mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Test Details
            </Button>
            
            <h1 className="text-2xl font-bold text-gray-900">Preview: {test.title}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">
              This test doesn't have any questions yet. Add questions to preview the test.
            </p>
            <Button
              onClick={() => router.push(`/questions/create?testId=${test.id}`)}
              className="flex items-center mx-auto"
            >
              <FaArrowLeft className="mr-2" />
              Add Questions
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push(`/tests/${id}`)}
            className="flex items-center mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Test Details
          </Button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Preview: {test.title}</h1>
            {test.time_limit > 0 && (
              <div className="flex items-center text-gray-600">
                <FaClock className="mr-2" />
                <span>Time Limit: {test.time_limit} minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Instructions</h2>
          <p className="text-gray-700 whitespace-pre-line">{test.instructions || 'No instructions provided.'}</p>
        </div>

        {/* Question Navigation */}
        <div className="bg-white rounded-lg shadow-soft p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
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
          
          {currentQuestion.type === 'mcq' && currentQuestion.answers && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Select the correct answer:</h3>
              {currentQuestion.answers.map((answer, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`answer-${index}`}
                    name="answer"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled
                  />
                  <label htmlFor={`answer-${index}`} className="ml-3 text-gray-700">
                    {answer.content}
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {currentQuestion.type === 'coding' && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Write your code:</h3>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 h-64 font-mono text-sm">
                {currentQuestion.content || '// Write your code here'}
              </div>
            </div>
          )}
          
          {currentQuestion.type === 'essay' && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Your answer:</h3>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-64"
                placeholder="Type your answer here..."
                disabled
              ></textarea>
            </div>
          )}
          
          {currentQuestion.type === 'file_upload' && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Upload your file:</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <FaUpload className="text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500">Click to upload or drag and drop</p>
                <p className="text-gray-400 text-sm mt-1">Supported file types: PDF, DOC, DOCX, ZIP</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
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
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center"
          >
            Next
            <FaArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestPreviewPage; 