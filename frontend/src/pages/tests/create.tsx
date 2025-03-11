import React, { useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TestForm from '@/components/assessments/TestForm';
import { assessmentsService } from '@/services/assessmentsService';
import { toast } from 'react-hot-toast';

const CreateTestPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      await assessmentsService.createTest(data);
      toast.success('Test created successfully');
      router.push('/tests');
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
          <p className="text-gray-600 mt-1">
            Create a new test to organize your questions and assessments.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <TestForm onSubmit={handleSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateTestPage; 