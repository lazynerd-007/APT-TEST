import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { FaPlus, FaTrash, FaClock, FaPercentage, FaChevronDown, FaChevronUp, FaExclamationCircle, FaGraduationCap } from 'react-icons/fa';
import SkillSelector from './SkillSelector';

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
    skillIds: string[];
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
    skills: true,
    tests: true,
  });

  const defaultValues = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    timeLimit: initialData?.timeLimit || 60,
    passingScore: initialData?.passingScore || 70,
    skillIds: initialData?.skillIds || [],
    tests: initialData?.tests || [],
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'tests',
  });

  const watchTests = watch('tests');
  const watchSkillIds = watch('skillIds');
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

  const handleSkillsChange = (skillIds: string[]) => {
    setValue('skillIds', skillIds, { shouldValidate: true });
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

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection('skills')}
        >
          <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">
              {watchSkillIds.length} skill{watchSkillIds.length !== 1 ? 's' : ''} selected
            </span>
            {expandedSections.skills ? (
              <FaChevronUp className="text-gray-500" />
            ) : (
              <FaChevronDown className="text-gray-500" />
            )}
          </div>
        </div>

        {expandedSections.skills && (
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <FaGraduationCap className="text-primary-500 mr-2" />
                <h3 className="text-md font-medium text-gray-700">Select Skills for this Assessment</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Choose the skills that will be evaluated in this assessment. These skills will be used for reporting and analytics.
              </p>
              
              <Controller
                name="skillIds"
                control={control}
                rules={{ 
                  validate: value => value.length > 0 || 'At least one skill is required' 
                }}
                render={({ field }) => (
                  <SkillSelector
                    selectedSkills={field.value}
                    onChange={handleSkillsChange}
                    required={true}
                    maxSkills={15}
                  />
                )}
              />
              {errors.skillIds && (
                <p className="mt-1 text-sm text-danger-600">{errors.skillIds.message?.toString()}</p>
              )}
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
                </div>
              ) : (
                <div>
                  {totalWeight !== 100 && (
                    <div className="mb-4 p-3 bg-warning-50 border border-warning-200 rounded-md flex items-start">
                      <FaExclamationCircle className="text-warning-500 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-warning-700">
                          The total weight of all tests should equal 100%. Current total: {totalWeight}%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-md font-medium">Test {index + 1}</h3>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => moveTestUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <span className="sr-only">Move up</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTestDown(index)}
                              disabled={index === fields.length - 1}
                              className={`p-1 rounded ${
                                index === fields.length - 1
                                  ? 'text-gray-300'
                                  : 'text-gray-500 hover:bg-gray-100'
                              }`}
                            >
                              <span className="sr-only">Move down</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                            >
                              <span className="sr-only">Remove</span>
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label
                              htmlFor={`tests.${index}.id`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Test*
                            </label>
                            <select
                              id={`tests.${index}.id`}
                              {...register(`tests.${index}.id` as const, {
                                required: 'Please select a test',
                              })}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors.tests?.[index]?.id ? 'border-danger-500' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select a test</option>
                              {availableTests.map((test) => (
                                <option key={test.id} value={test.id}>
                                  {test.title} ({test.category} - {test.difficulty})
                                </option>
                              ))}
                            </select>
                            {errors.tests?.[index]?.id && (
                              <p className="mt-1 text-sm text-danger-600">
                                {errors.tests[index]?.id?.message?.toString()}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor={`tests.${index}.weight`}
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Weight (%)*
                            </label>
                            <input
                              id={`tests.${index}.weight`}
                              type="number"
                              min="1"
                              max="100"
                              {...register(`tests.${index}.weight` as const, {
                                required: 'Weight is required',
                                min: { value: 1, message: 'Minimum 1%' },
                                max: { value: 100, message: 'Maximum 100%' },
                              })}
                              className={`w-full px-3 py-2 border rounded-md ${
                                errors.tests?.[index]?.weight ? 'border-danger-500' : 'border-gray-300'
                              }`}
                            />
                            {errors.tests?.[index]?.weight && (
                              <p className="mt-1 text-sm text-danger-600">
                                {errors.tests[index]?.weight?.message?.toString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleAddTest}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                  Add Test
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300"
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Assessment' : 'Create Assessment'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm; 