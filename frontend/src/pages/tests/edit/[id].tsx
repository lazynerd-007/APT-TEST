import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TestForm from '@/components/assessments/TestForm';
import { assessmentsService } from '@/services/assessmentsService';
import { Spinner } from '@/components/ui';
import { toast } from 'react-hot-toast';

const EditTestPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTest();
    }
  }, [id]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const testData = await assessmentsService.getTest(id as string);
      setTest(testData);
    } catch (error) {
      console.error('Error fetching test:', error);
      toast.error('Failed to load test');
      router.push('/tests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await assessmentsService.updateTest(id as string, data);
      toast.success('Test updated successfully');
      router.push('/tests');
    } catch (error) {
      console.error('Error updating test:', error);
      toast.error('Failed to update test');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Test</h1>
          <p className="text-gray-600 mt-1">
            Update test details and settings.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-soft p-6">
            <TestForm 
              initialData={test} 
              onSubmit={handleSubmit} 
              isLoading={isSubmitting} 
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditTestPage; 