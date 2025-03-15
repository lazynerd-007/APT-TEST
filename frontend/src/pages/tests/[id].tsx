import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaDownload, FaUpload, FaEye } from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';
import assessmentsService from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';
import ImportQuestionsModal from '@/components/tests/ImportQuestionsModal';

const TestDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importModalOpen, setImportModalOpen] = useState(false);

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
      toast.error('Failed to load test details');
      router.push('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await assessmentsService.deleteQuestion(questionId);
        toast.success('Question deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const difficulties = {
      easy: 'bg-success-100 text-success-800',
      medium: 'bg-warning-100 text-warning-800',
      hard: 'bg-danger-100 text-danger-800',
    };

    return (
      <Badge className={`${difficulties[difficulty] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {difficulty}
      </Badge>
    );
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExportQuestions = async () => {
    try {
      await assessmentsService.exportQuestionsCSV(id as string);
      toast.success('Questions exported successfully');
    } catch (error) {
      console.error('Error exporting questions:', error);
      toast.error('Failed to export questions');
    }
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/tests')}
            className="flex items-center mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to Tests
          </Button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/tests/preview/${test.id}`)}
                className="flex items-center"
                disabled={questions.length === 0}
              >
                <FaEye className="mr-2" />
                Preview Test
              </Button>
              <Button
                variant="outline"
                onClick={handleExportQuestions}
                className="flex items-center"
                disabled={questions.length === 0}
              >
                <FaDownload className="mr-2" />
                Export Questions
              </Button>
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                className="flex items-center"
              >
                <FaUpload className="mr-2" />
                Import Questions
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/tests/edit/${test.id}`)}
                className="flex items-center"
              >
                <FaEdit className="mr-2" />
                Edit Test
              </Button>
              <Button
                onClick={() => router.push(`/questions/create?testId=${test.id}`)}
                className="flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </div>

        {/* Test Details */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Details</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <p className="text-gray-900">{test.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                  <div className="mt-1">{getDifficultyBadge(test.difficulty)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Time Limit:</span>
                  <p className="text-gray-900">
                    {test.time_limit ? `${test.time_limit} minutes` : 'No time limit'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <p className="text-gray-900">
                    <Badge className={test.is_active ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'}>
                      {test.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <p className="text-gray-900">{formatDate(test.created_at)}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{test.description || 'No description provided.'}</p>
              
              <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Instructions</h2>
              <p className="text-gray-700 whitespace-pre-line">{test.instructions || 'No instructions provided.'}</p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Questions ({questions.length})</h2>
          
          {questions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-8 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-2">No questions found</h3>
              <p className="text-gray-500 mb-4">
                This test doesn't have any questions yet. Add questions to make it available for assessments.
              </p>
              <Button
                onClick={() => router.push(`/questions/create?testId=${test.id}`)}
                className="flex items-center mx-auto"
              >
                <FaPlus className="mr-2" />
                Add Question
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Question
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Difficulty
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Points
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {question.content && question.content.length > 100
                              ? `${question.content.substring(0, 100)}...`
                              : question.content}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getQuestionTypeBadge(question.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getDifficultyBadge(question.difficulty)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{question.points}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => router.push(`/questions/edit/${question.id}`)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit Question"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-danger-600 hover:text-danger-900"
                              title="Delete Question"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImportQuestionsModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        testId={id as string}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  );
};

export default TestDetailsPage; 