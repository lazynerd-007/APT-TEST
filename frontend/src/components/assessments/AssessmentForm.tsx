import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { FaPlus, FaTrash, FaClock, FaPercentage, FaChevronDown, FaChevronUp, FaExclamationCircle } from 'react-icons/fa';

interface TestOption {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

interface AssessmentFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    timeLimit: number;
    passingScore: number;
    tests: Array<{
      id: string;
      title: string;
      weight: number;
      order: number;
    }>;
  };
  availableTests: TestOption[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  initialData,
  availableTests,
  onSubmit,
  isSubmitting = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    details: true,
    tests: true,
  });

  const defaultValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    timeLimit: initialData?.timeLimit || 60,
    passingScore: initialData?.passingScore || 70,
    tests: initialData?.tests || [],
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'tests',
  });

  const watchTests = watch('tests');
  const totalWeight = watchTests.reduce((sum, test) => sum + (parseFloat(test.weight) || 0), 0);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddTest = () => {
    append({
      id: '',
      title: '',
      weight: 1,
      order: fields.length,
    });
  };

  const moveTestUp = (index: number) => {
    if (index > 0) {
      move(index, index - 1);
    }
  };

  const moveTestDown = (index: number) => {
    if (index < fields.length - 1) {
      move(index, index + 1);
    }
  };

  const handleFormSubmit = async (data: any) => {
    // Update order based on current position
    const testsWithOrder = data.tests.map((test: any, index: number) => ({
      ...test,
      order: index,
    }));

    await onSubmit({
      ...data,
      tests: testsWithOrder,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Assessment Details Section */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection('details')}
        >
          <h2 className="text-lg font-semibold text-gray-800">Assessment Details</h2>
          <div>
            {expandedSections.details ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </div>
        </div>

        {expandedSections.details && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Title*
                </label>
                <input
                  id="title"
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.title ? 'border-danger-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Full Stack Developer Assessment"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-danger-600">{errors.title.message?.toString()}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description', { required: 'Description is required' })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.description ? 'border-danger-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the purpose and content of this assessment"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description.message?.toString()}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaClock className="text-gray-400" />
                    </div>
                    <input
                      id="timeLimit"
                      type="number"
                      min="5"
                      max="240"
                      {...register('timeLimit', {
                        required: 'Time limit is required',
                        min: { value: 5, message: 'Minimum 5 minutes' },
                        max: { value: 240, message: 'Maximum 240 minutes' },
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md ${
                        errors.timeLimit ? 'border-danger-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.timeLimit && (
                    <p className="mt-1 text-sm text-danger-600">{errors.timeLimit.message?.toString()}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%)*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPercentage className="text-gray-400" />
                    </div>
                    <input
                      id="passingScore"
                      type="number"
                      min="1"
                      max="100"
                      {...register('passingScore', {
                        required: 'Passing score is required',
                        min: { value: 1, message: 'Minimum 1%' },
                        max: { value: 100, message: 'Maximum 100%' },
                      })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md ${
                        errors.passingScore ? 'border-danger-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.passingScore && (
                    <p className="mt-1 text-sm text-danger-600">{errors.passingScore.message?.toString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tests Section */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection('tests')}
        >
          <h2 className="text-lg font-semibold text-gray-800">Tests</h2>
          <div>
            {expandedSections.tests ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </div>
        </div>

        {expandedSections.tests && (
          <div className="p-6">
            <div className="space-y-6">
              {fields.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No tests added yet. Add tests to your assessment.</p>
                  <button
                    type="button"
                    onClick={handleAddTest}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <FaPlus className="mr-2" /> Add Test
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                              {index + 1}
                            </span>
                            <h3 className="font-medium">Test {index + 1}</h3>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => moveTestUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <FaChevronUp />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTestDown(index)}
                              disabled={index === fields.length - 1}
                              className={`p-1 rounded ${
                                index === fields.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <FaChevronDown />
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Select Test*
                            </label>
                            <Controller
                              control={control}
                              name={`tests.${index}.id`}
                              rules={{ required: 'Please select a test' }}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  className={`w-full px-3 py-2 border rounded-md ${
                                    errors.tests?.[index]?.id ? 'border-danger-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Select a test</option>
                                  {availableTests.map((test) => (
                                    <option key={test.id} value={test.id}>
                                      {test.title} ({test.difficulty} - {test.category})
                                    </option>
                                  ))}
                                </select>
                              )}
                            />
                            {errors.tests?.[index]?.id && (
                              <p className="mt-1 text-sm text-danger-600">
                                {errors.tests[index]?.id?.message?.toString()}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Weight*
                            </label>
                            <Controller
                              control={control}
                              name={`tests.${index}.weight`}
                              rules={{
                                required: 'Weight is required',
                                min: { value: 0.1, message: 'Minimum weight is 0.1' },
                                max: { value: 10, message: 'Maximum weight is 10' },
                              }}
                              render={({ field }) => (
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0.1"
                                  max="10"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  className={`w-full px-3 py-2 border rounded-md ${
                                    errors.tests?.[index]?.weight ? 'border-danger-500' : 'border-gray-300'
                                  }`}
                                />
                              )}
                            />
                            {errors.tests?.[index]?.weight && (
                              <p className="mt-1 text-sm text-danger-600">
                                {errors.tests[index]?.weight?.message?.toString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Display test details if a test is selected */}
                        {watchTests[index]?.id && (
                          <div className="mt-4 bg-gray-50 p-3 rounded-md">
                            {availableTests
                              .filter((test) => test.id === watchTests[index].id)
                              .map((test) => (
                                <div key={test.id}>
                                  <h4 className="font-medium">{test.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                                  <div className="flex mt-2 space-x-4">
                                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                                      {test.category}
                                    </span>
                                    <span className="text-xs bg-secondary-100 text-secondary-800 px-2 py-1 rounded">
                                      {test.difficulty}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      type="button"
                      onClick={handleAddTest}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <FaPlus className="mr-2" /> Add Test
                    </button>

                    <div className="text-sm">
                      <span className="font-medium">Total Weight:</span>{' '}
                      <span
                        className={`${
                          Math.abs(totalWeight - 1) > 0.01 ? 'text-warning-600 font-bold' : 'text-gray-600'
                        }`}
                      >
                        {totalWeight.toFixed(2)}
                      </span>
                      {Math.abs(totalWeight - 1) > 0.01 && (
                        <div className="flex items-center text-warning-600 mt-1">
                          <FaExclamationCircle className="mr-1" />
                          <span className="text-xs">Total weight should be 1.00</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || Math.abs(totalWeight - 1) > 0.01}
          className={`px-6 py-3 rounded-md shadow-sm text-white font-medium ${
            isSubmitting || Math.abs(totalWeight - 1) > 0.01
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Assessment' : 'Create Assessment'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm; 