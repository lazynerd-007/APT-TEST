import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaClipboardCheck, FaSave, FaTimes } from 'react-icons/fa';

interface Skill {
  id: string;
  name: string;
}

const CreateAssessmentPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(60);
  const [passingScore, setPassingScore] = useState(70);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Notifications
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  useEffect(() => {
    // In a real app, fetch skills from API
    // For now, use mock data
    setSkills([
      { id: '1', name: 'JavaScript' },
      { id: '2', name: 'Python' },
      { id: '3', name: 'SQL' },
      { id: '4', name: 'React' },
      { id: '5', name: 'Django' }
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || selectedSkills.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields and select at least one skill.',
        duration: 5000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, this would be an API call
      // await fetch('/api/v1/assessments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     title,
      //     description,
      //     timeLimit,
      //     passingScore,
      //     skillIds: selectedSkills
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
  
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };
  
  // Function to add a notification
  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
    
    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }
  };

  // Function to remove a notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <DashboardLayout
      title="Create Assessment"
      icon={<FaClipboardCheck className="text-blue-600" />}
      description="Create a new assessment for evaluating candidates"
      notifications={notifications}
      onCloseNotification={removeNotification}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Full Stack Developer Assessment"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this assessment evaluates..."
                required
              />
            </div>
            
            {/* Time Limit and Passing Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={10}
                  max={240}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                {skills.length === 0 ? (
                  <p className="text-gray-500 text-sm">Loading skills...</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`skill-${skill.id}`}
                          checked={selectedSkills.includes(skill.id)}
                          onChange={() => toggleSkill(skill.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`skill-${skill.id}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {skill.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedSkills.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
            
            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaTimes className="mr-2 -ml-1 h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <FaSave className="mr-2 -ml-1 h-4 w-4" />
                {loading ? 'Creating...' : 'Create Assessment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateAssessmentPage; 