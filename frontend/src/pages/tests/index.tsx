import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaPlus, FaEdit, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import DashboardLayout from '@/components/layout/DashboardLayout';
import assessmentsService from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';

const TestsPage = () => {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const testsData = await assessmentsService.getTests();
      console.log('Fetched tests:', testsData);
      setTests(Array.isArray(testsData) ? testsData : testsData.results || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test? This will also delete all associated questions.')) {
      try {
        await assessmentsService.deleteTest(id);
        toast.success('Test deleted successfully');
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
        toast.error('Failed to delete test');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
          <Button
            onClick={() => router.push('/tests/create')}
            className="flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Test
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No tests found</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first test.
            </p>
            <Button
              onClick={() => router.push('/tests/create')}
              className="flex items-center mx-auto"
            >
              <FaPlus className="mr-2" />
              Create Test
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
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
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
                      Questions
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Created
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
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <a 
                            href={`/tests/${test.id}`}
                            className="hover:text-primary-600 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/tests/${test.id}`);
                            }}
                          >
                            {test.title}
                          </a>
                        </div>
                        <div className="text-sm text-gray-500">
                          {test.description && test.description.length > 50
                            ? `${test.description.substring(0, 50)}...`
                            : test.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{test.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getDifficultyBadge(test.difficulty)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/questions?testId=${test.id}`)}
                          className="flex items-center"
                        >
                          <FaQuestionCircle className="mr-1" />
                          {test.question_count || 0} Questions
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(test.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => router.push(`/tests/edit/${test.id}`)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit Test"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="text-danger-600 hover:text-danger-900"
                            title="Delete Test"
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
    </DashboardLayout>
  );
};

export default TestsPage; 