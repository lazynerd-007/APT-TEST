import React, { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { FaPlus, FaTrash, FaCode, FaList, FaPen, FaFile, FaCheck } from 'react-icons/fa';
import CodeEditor from '../CodeEditor';

interface SkillOption {
  id: string;
  name: string;
  category: string;
}

interface TestOption {
  id: string;
  title: string;
}

interface QuestionFormProps {
  initialData?: {
    id?: string;
    content: string;
    type: 'mcq' | 'coding' | 'essay' | 'file_upload';
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    test?: string; // Test ID
    answers?: Array<{
      id?: string;
      content: string;
      isCorrect: boolean;
      explanation?: string;
    }>;
    testCases?: Array<{
      id?: string;
      input: string;
      expectedOutput: string;
      isHidden: boolean;
    }>;
    skills?: Array<{
      id: string;
      weight: number;
    }>;
  };
  availableSkills: SkillOption[];
  availableTests: TestOption[];
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  availableSkills,
  availableTests,
  onSubmit,
  isSubmitting = false,
}) => {
  const [codeTemplate, setCodeTemplate] = useState(
    initialData?.type === 'coding' ? initialData.content : '// Write your code here'
  );

  const defaultValues = {
    content: initialData?.content || '',
    type: initialData?.type || 'mcq',
    difficulty: initialData?.difficulty || 'medium',
    points: initialData?.points || 1,
    test: initialData?.test || '',
    answers: initialData?.answers || [
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
    ],
    testCases: initialData?.testCases || [
      { input: '', expectedOutput: '', isHidden: false },
    ],
    skills: initialData?.skills || [],
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

  const questionType = watch('type');

  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({
    control,
    name: 'answers',
  });

  const {
    fields: testCaseFields,
    append: appendTestCase,
    remove: removeTestCase,
  } = useFieldArray({
    control,
    name: 'testCases',
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  });

  const handleAddAnswer = () => {
    appendAnswer({ content: '', isCorrect: false, explanation: '' });
  };

  const handleAddTestCase = () => {
    appendTestCase({ input: '', expectedOutput: '', isHidden: false });
  };

  const handleAddSkill = () => {
    appendSkill({ id: '', weight: 1 });
  };

  const handleCodeChange = (code: string) => {
    setCodeTemplate(code);
    setValue('content', code);
  };

  const handleFormSubmit = async (data: any) => {
    // For coding questions, ensure content is set to the code template
    if (data.type === 'coding') {
      data.content = codeTemplate;
    }

    // For MCQ, ensure at least one answer is marked as correct
    if (data.type === 'mcq' && !data.answers.some((answer: any) => answer.isCorrect)) {
      alert('Please mark at least one answer as correct.');
      return;
    }

    await onSubmit(data);
  };

  // Calculate total skill weight
  const totalSkillWeight = watch('skills').reduce(
    (sum, skill) => sum + (parseFloat(String(skill.weight)) || 0),
    0
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Question Type Selection */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Question Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              questionType === 'mcq'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              value="mcq"
              {...register('type')}
              className="sr-only"
            />
            <FaList className="text-2xl mb-2" />
            <span className="font-medium">Multiple Choice</span>
          </label>

          <label
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              questionType === 'coding'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              value="coding"
              {...register('type')}
              className="sr-only"
            />
            <FaCode className="text-2xl mb-2" />
            <span className="font-medium">Coding</span>
          </label>

          <label
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              questionType === 'essay'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              value="essay"
              {...register('type')}
              className="sr-only"
            />
            <FaPen className="text-2xl mb-2" />
            <span className="font-medium">Essay</span>
          </label>

          <label
            className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              questionType === 'file_upload'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              value="file_upload"
              {...register('type')}
              className="sr-only"
            />
            <FaFile className="text-2xl mb-2" />
            <span className="font-medium">File Upload</span>
          </label>
        </div>
      </div>

      {/* Question Details */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Question Details</h2>
        
        {/* Test Selection */}
        <div className="mb-4">
          <label htmlFor="test" className="block text-sm font-medium text-gray-700 mb-1">
            Test*
          </label>
          <select
            id="test"
            {...register('test', { required: 'Please select a test' })}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.test ? 'border-danger-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a test</option>
            {availableTests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.title}
              </option>
            ))}
          </select>
          {errors.test && (
            <p className="mt-1 text-sm text-danger-600">{errors.test.message?.toString()}</p>
          )}
          {availableTests.length === 0 && (
            <p className="mt-1 text-sm text-warning-600">
              No tests available. Please create a test first.
            </p>
          )}
        </div>
        
        {/* Question Content */}
        {questionType !== 'coding' && (
          <div className="mb-4">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Question Content*
            </label>
            <textarea
              id="content"
              rows={4}
              {...register('content', { required: 'Question content is required' })}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.content ? 'border-danger-500' : 'border-gray-300'
              }`}
              placeholder="Enter your question here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-danger-600">{errors.content.message?.toString()}</p>
            )}
          </div>
        )}

        {/* Code Editor for Coding Questions */}
        {questionType === 'coding' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Template*
            </label>
            <div className="border rounded-md overflow-hidden h-64">
              <CodeEditor
                initialCode={codeTemplate}
                language="javascript"
                onSubmit={async (code) => {
                  handleCodeChange(code);
                  return { status: 'success' };
                }}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This template will be shown to candidates as a starting point.
            </p>
          </div>
        )}

        {/* Difficulty and Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty*
            </label>
            <select
              id="difficulty"
              {...register('difficulty', { required: 'Difficulty is required' })}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.difficulty ? 'border-danger-500' : 'border-gray-300'
              }`}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty && (
              <p className="mt-1 text-sm text-danger-600">{errors.difficulty.message?.toString()}</p>
            )}
          </div>

          <div>
            <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
              Points*
            </label>
            <input
              id="points"
              type="number"
              min="1"
              max="100"
              {...register('points', {
                required: 'Points are required',
                min: { value: 1, message: 'Minimum 1 point' },
                max: { value: 100, message: 'Maximum 100 points' },
              })}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.points ? 'border-danger-500' : 'border-gray-300'
              }`}
            />
            {errors.points && (
              <p className="mt-1 text-sm text-danger-600">{errors.points.message?.toString()}</p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            <button
              type="button"
              onClick={handleAddSkill}
              className="inline-flex items-center px-2 py-1 border border-transparent rounded text-xs font-medium text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <FaPlus className="mr-1" /> Add Skill
            </button>
          </div>
          
          {skillFields.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No skills added yet. Add skills to help with analytics.</p>
          ) : (
            <div className="space-y-3">
              {skillFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <Controller
                      control={control}
                      name={`skills.${index}.id`}
                      rules={{ required: 'Skill is required' }}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.skills?.[index]?.id ? 'border-danger-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select a skill</option>
                          {availableSkills.map((skill) => (
                            <option key={skill.id} value={skill.id}>
                              {skill.name} ({skill.category})
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <div className="w-24">
                    <Controller
                      control={control}
                      name={`skills.${index}.weight`}
                      rules={{
                        required: 'Weight is required',
                        min: { value: 0.1, message: 'Minimum 0.1' },
                        max: { value: 1, message: 'Maximum 1' },
                      }}
                      render={({ field }) => (
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="1"
                          placeholder="Weight"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.skills?.[index]?.weight ? 'border-danger-500' : 'border-gray-300'
                          }`}
                        />
                      )}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-danger-500 hover:bg-danger-50 rounded"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              
              {/* Total weight indicator */}
              <div className="text-sm mt-2">
                <span className="font-medium">Total Weight:</span>{' '}
                <span
                  className={`${
                    Math.abs(totalSkillWeight - 1) > 0.01 ? 'text-warning-600 font-bold' : 'text-gray-600'
                  }`}
                >
                  {totalSkillWeight.toFixed(2)}
                </span>
                {Math.abs(totalSkillWeight - 1) > 0.01 && (
                  <span className="text-warning-600 ml-2 text-xs">
                    (Total weight should be 1.00)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multiple Choice Answers (for MCQ) */}
      {questionType === 'mcq' && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Answer Options</h2>
            <button
              type="button"
              onClick={handleAddAnswer}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <FaPlus className="mr-1" /> Add Option
            </button>
          </div>

          {answerFields.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No answer options added yet.</p>
          ) : (
            <div className="space-y-4">
              {answerFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <h3 className="font-medium">Option {index + 1}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Answer Content*
                      </label>
                      <input
                        type="text"
                        {...register(`answers.${index}.content`, {
                          required: 'Answer content is required',
                        })}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.answers?.[index]?.content ? 'border-danger-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter answer option"
                      />
                      {errors.answers?.[index]?.content && (
                        <p className="mt-1 text-sm text-danger-600">
                          {errors.answers[index]?.content?.message?.toString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Controller
                          control={control}
                          name={`answers.${index}.isCorrect`}
                          render={({ field: { onChange, value, ref } }) => (
                            <input
                              type="checkbox"
                              onChange={onChange}
                              checked={value}
                              ref={ref}
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          )}
                        />
                        <span>Correct Answer</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Explanation (Optional)
                      </label>
                      <textarea
                        {...register(`answers.${index}.explanation`)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Explain why this answer is correct or incorrect"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Test Cases (for Coding Questions) */}
      {questionType === 'coding' && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Test Cases</h2>
            <button
              type="button"
              onClick={handleAddTestCase}
              className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <FaPlus className="mr-1" /> Add Test Case
            </button>
          </div>

          {testCaseFields.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No test cases added yet.</p>
          ) : (
            <div className="space-y-4">
              {testCaseFields.map((field, index) => (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        {index + 1}
                      </span>
                      <h3 className="font-medium">Test Case {index + 1}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input*
                      </label>
                      <textarea
                        {...register(`testCases.${index}.input`, {
                          required: 'Input is required',
                        })}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
                          errors.testCases?.[index]?.input ? 'border-danger-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., [1, 2, 3]"
                      />
                      {errors.testCases?.[index]?.input && (
                        <p className="mt-1 text-sm text-danger-600">
                          {errors.testCases[index]?.input?.message?.toString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Output*
                      </label>
                      <textarea
                        {...register(`testCases.${index}.expectedOutput`, {
                          required: 'Expected output is required',
                        })}
                        rows={2}
                        className={`w-full px-3 py-2 border rounded-md font-mono text-sm ${
                          errors.testCases?.[index]?.expectedOutput ? 'border-danger-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 6"
                      />
                      {errors.testCases?.[index]?.expectedOutput && (
                        <p className="mt-1 text-sm text-danger-600">
                          {errors.testCases[index]?.expectedOutput?.message?.toString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <Controller
                          control={control}
                          name={`testCases.${index}.isHidden`}
                          render={({ field: { onChange, value, ref } }) => (
                            <input
                              type="checkbox"
                              onChange={onChange}
                              checked={value}
                              ref={ref}
                              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          )}
                        />
                        <span>Hidden from candidates</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Hidden test cases are used for evaluation but not shown to candidates.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || (skillFields.length > 0 && Math.abs(totalSkillWeight - 1) > 0.01)}
          className={`px-6 py-3 rounded-md shadow-sm text-white font-medium ${
            isSubmitting || (skillFields.length > 0 && Math.abs(totalSkillWeight - 1) > 0.01)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Question' : 'Create Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm; 