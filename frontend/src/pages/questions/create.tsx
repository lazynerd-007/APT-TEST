import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QuestionForm from '@/components/assessments/QuestionForm';
import { assessmentsService } from '@/services/assessmentsService';
import { Spinner } from '@/components/ui';
import { toast } from 'react-hot-toast';

const CreateQuestionPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const { testId } = router.query;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [skillsData, testsData] = await Promise.all([
          assessmentsService.getSkills(),
          assessmentsService.getTests(),
        ]);
        
        setAvailableSkills(skillsData);
        setAvailableTests(testsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      // Add the test ID if it was provided in the URL
      if (testId) {
        data.test = testId;
      }
      
      // This endpoint needs to be implemented in the assessmentsService
      await assessmentsService.createQuestion(data);
      
      toast.success('Question created successfully');
      router.push('/questions');
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error('Failed to create question');
    } finally {
      setSubmitting(false);
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
          <p className="text-gray-600 mt-1">
            Add a new question to your assessment library
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          {/* Test Selection */}
          {!testId && (
            <div className="mb-6">
              <label htmlFor="test" className="block text-sm font-medium text-gray-700 mb-1">
                Select Test*
              </label>
              <select
                id="test"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                onChange={(e) => {
                  const newUrl = `/questions/create?testId=${e.target.value}`;
                  router.push(newUrl);
                }}
                value={testId || ''}
              >
                <option value="">Select a test</option>
                {availableTests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Questions must be associated with a test
              </p>
            </div>
          )}

          {/* Show the form only if a test is selected */}
          {testId ? (
            <QuestionForm
              availableSkills={availableSkills}
              availableTests={availableTests}
              onSubmit={handleSubmit}
              isSubmitting={submitting}
              initialData={{ test: testId as string }}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              Please select a test to continue
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateQuestionPage; 