import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaClipboardCheck, FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import assessmentsService, { AssessmentCreateUpdate } from '../../services/assessmentsService';
import skillsService, { Skill } from '../../services/skillsService';
import SkillSelector from '../../components/assessments/SkillSelector';
import { useAuth } from '../../contexts/AuthContext';

// Hardcoded UUIDs for development
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000002';

const CreateAssessmentPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingSkills, setFetchingSkills] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [fetchingTests, setFetchingTests] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    description?: string;
    skills?: string;
  }>({});
  
  // Notifications
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  useEffect(() => {
    // Fetch skills from API
    const fetchSkills = async () => {
      setFetchingSkills(true);
      try {
        const skillsData = await skillsService.getSkills();
        console.log('Fetched skills:', skillsData);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      } catch (error) {
        console.error('Error fetching skills:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load skills. Please refresh the page.',
          duration: 5000
        });
      } finally {
        setFetchingSkills(false);
      }
    };

    // Fetch tests from API
    const fetchTests = async () => {
      setFetchingTests(true);
      try {
        const testsData = await assessmentsService.getTests();
        console.log('Fetched tests:', testsData);
        setAvailableTests(Array.isArray(testsData) ? testsData : []);
      } catch (error) {
        console.error('Error fetching tests:', error);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load tests. Please refresh the page.',
          duration: 5000
        });
      } finally {
        setFetchingTests(false);
      }
    };

    fetchSkills();
    fetchTests();
  }, []);

  const validateForm = () => {
    const errors: {
      title?: string;
      description?: string;
      skills?: string;
    } = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (selectedSkills.length === 0) {
      errors.skills = 'At least one skill is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form.',
        duration: 5000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare assessment data with hardcoded UUIDs
      const assessmentData: AssessmentCreateUpdate = {
        title,
        description,
        time_limit: timeLimit,
        passing_score: passingScore,
        created_by: DEMO_USER_ID, // Use hardcoded UUID
        organization: DEMO_ORGANIZATION_ID, // Use hardcoded UUID
        is_active: true,
        skill_data: selectedSkills.map(skillId => ({
          skill_id: skillId,
          importance: 'primary'
        }))
      };
      
      console.log('Creating assessment with data:', assessmentData);
      
      // Create assessment
      const createdAssessment = await assessmentsService.createAssessment(assessmentData);
      console.log('Created assessment:', createdAssessment);
      
      addNotification({
        type: 'success',
        title: 'Assessment Created',
        message: `Assessment "${title}" was created successfully.`,
        duration: 5000
      });
      
      // Redirect to assessments list
      router.push('/assessments');
    } catch (error) {
      console.error('Error creating assessment:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create assessment. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/assessments');
  };
  
  const handleSkillsChange = (skillIds: string[]) => {
    setSelectedSkills(skillIds);
    if (formErrors.skills && skillIds.length > 0) {
      setFormErrors(prev => ({ ...prev, skills: undefined }));
    }
  };
  
  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`rounded-md p-4 shadow-md ${
                  notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
                  notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                  'bg-blue-50 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-sm font-medium ${
                      notification.type === 'success' ? 'text-green-800' :
                      notification.type === 'error' ? 'text-red-800' :
                      notification.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Create Assessment
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FaClipboardCheck className="mr-2 text-primary-500" />
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (formErrors.title && e.target.value.trim()) {
                          setFormErrors(prev => ({ ...prev, title: undefined }));
                        }
                      }}
                      className={`mt-1 block w-full border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="Enter assessment title"
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (formErrors.description && e.target.value.trim()) {
                          setFormErrors(prev => ({ ...prev, description: undefined }));
                        }
                      }}
                      rows={4}
                      className={`mt-1 block w-full border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="Enter assessment description"
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
                        Time Limit (minutes)
                      </label>
                      <input
                        type="number"
                        id="timeLimit"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                        min="1"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700">
                        Passing Score (%)
                      </label>
                      <input
                        type="number"
                        id="passingScore"
                        value={passingScore}
                        onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Skills</h2>
                {fetchingSkills ? (
                  <div className="flex justify-center items-center h-32">
                    <FaSpinner className="animate-spin text-primary-500 text-2xl" />
                    <span className="ml-2 text-gray-600">Loading skills...</span>
                  </div>
                ) : (
                  <SkillSelector
                    selectedSkills={selectedSkills}
                    onChange={handleSkillsChange}
                    required={true}
                  />
                )}
                {formErrors.skills && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.skills}</p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateAssessmentPage; 