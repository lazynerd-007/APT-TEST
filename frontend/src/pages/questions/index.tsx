import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';
import assessmentsService from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';
import CSVUploadModal from '@/components/assessments/CSVUploadModal';

const QuestionsPage = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(router.query.testId || '');

  useEffect(() => {
    fetchData();
  }, [router.query.testId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const testId = router.query.testId as string;
      setSelectedTestId(testId || '');
      
      // If a test ID is provided, fetch questions for that test
      const params = testId ? { test: testId } : {};
      
      const [questionsData, testsData] = await Promise.all([
        assessmentsService.getQuestions(params),
        assessmentsService.getTests(),
      ]);
      
      // Ensure questions is always an array
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setAvailableTests(Array.isArray(testsData) ? testsData : []);
      
      console.log('Fetched questions:', questionsData);
      console.log('Fetched tests:', testsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load questions');
      // Set empty arrays in case of error
      setQuestions([]);
      setAvailableTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        // This endpoint needs to be implemented in the assessmentsService
        await assessmentsService.deleteQuestion(id);
        toast.success('Question deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const handleCSVUpload = async (file, testId) => {
    try {
      // This endpoint needs to be implemented in the assessmentsService
      await assessmentsService.uploadQuestionsCSV(file, testId);
      toast.success('Questions uploaded successfully');
      fetchData();
    } catch (error) {
      console.error('Error uploading questions:', error);
      toast.error('Failed to upload questions');
      throw error; // Re-throw to be caught by the modal
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(true)}
              className="flex items-center"
            >
              <FaUpload className="mr-2" />
              Upload CSV
            </Button>
            <Button
              onClick={() => router.push('/questions/create')}
              className="flex items-center"
            >
              <FaPlus className="mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Test Filter */}
        <div className="mb-6 bg-white rounded-lg shadow-soft p-4">
          <div className="flex flex-col md:flex-row md:items-center">
            <label htmlFor="test-filter" className="block text-sm font-medium text-gray-700 mb-2 md:mb-0 md:mr-4">
              Filter by Test:
            </label>
            <div className="flex-grow">
              <select
                id="test-filter"
                value={selectedTestId}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    router.push(`/questions?testId=${value}`);
                  } else {
                    router.push('/questions');
                  }
                }}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Tests</option>
                {availableTests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedTestId && (
              <div className="mt-2 md:mt-0 md:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/questions')}
                  className="flex items-center"
                >
                  Clear Filter
                </Button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No questions found</h3>
            <p className="text-gray-500 mb-4">
              Get started by adding your first question or uploading a CSV file.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
                className="flex items-center"
              >
                <FaUpload className="mr-2" />
                Upload CSV
              </Button>
              <Button
                onClick={() => router.push('/questions/create')}
                className="flex items-center"
              >
                <FaPlus className="mr-2" />
                Add Question
              </Button>
            </div>
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Test
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
                  {Array.isArray(questions) && questions.length > 0 ? (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {question.content && question.content.length > 100
                              ? `${question.content.substring(0, 100)}...`
                              : question.content || 'No content'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getQuestionTypeBadge(question.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getDifficultyBadge(question.difficulty)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{question.points || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {question.test_details?.title || question.test || 'Unknown Test'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => router.push(`/questions/edit/${question.id}`)}
                            >
                              <FaEdit className="mr-1" /> Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(question.id)}
                            >
                              <FaTrash className="mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        {loading ? 'Loading questions...' : 'No questions found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CSV Upload Modal */}
        <CSVUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleCSVUpload}
          availableTests={availableTests}
        />
      </div>
    </DashboardLayout>
  );
};

export default QuestionsPage; 