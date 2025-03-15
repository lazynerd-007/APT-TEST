import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QuestionForm from '@/components/assessments/QuestionForm';
import assessmentsService from '@/services/assessmentsService';
import { Spinner } from '@/components/ui';
import { toast } from 'react-hot-toast';

const EditQuestionPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [question, setQuestion] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [questionData, skillsData, testsData] = await Promise.all([
          // This endpoint needs to be implemented in the assessmentsService
          assessmentsService.getQuestion(id as string),
          assessmentsService.getSkills(),
          assessmentsService.getTests(),
        ]);
        
        setQuestion(questionData);
        setAvailableSkills(skillsData);
        setAvailableTests(testsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load question data');
        router.push('/questions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      // This endpoint needs to be implemented in the assessmentsService
      await assessmentsService.updateQuestion(id as string, data);
      
      toast.success('Question updated successfully');
      router.push('/questions');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
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

  if (!question) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Question not found</h3>
            <p className="text-gray-500 mb-4">
              The question you are looking for does not exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/questions')}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Back to Questions
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
          <p className="text-gray-600 mt-1">
            Update the details of your question
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <QuestionForm
            initialData={question}
            availableSkills={availableSkills}
            availableTests={availableTests}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditQuestionPage; 