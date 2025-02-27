import React, { useState } from 'react';
import { NextPage } from 'next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkillManagement from '../../components/skills/SkillManagement';
import { Skill } from '../../services/skillsService';
import { FaGraduationCap } from 'react-icons/fa';

const SkillsPage: NextPage = () => {
  // State for notifications
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  // Handlers for skill events
  const handleSkillCreated = (skill: Skill) => {
    console.log('Skill created:', skill);
    // Show a notification
    addNotification({
      type: 'success',
      title: 'Skill Created',
      message: `The skill "${skill.name}" was created successfully.`,
      duration: 5000
    });
  };

  const handleSkillUpdated = (skill: Skill) => {
    console.log('Skill updated:', skill);
    // Show a notification
    addNotification({
      type: 'success',
      title: 'Skill Updated',
      message: `The skill "${skill.name}" was updated successfully.`,
      duration: 5000
    });
  };

  const handleSkillDeleted = (id: string) => {
    console.log('Skill deleted:', id);
    // Show a notification
    addNotification({
      type: 'info',
      title: 'Skill Deleted',
      message: 'The skill was deleted successfully.',
      duration: 5000
    });
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
      title="Skills Management"
      icon={<FaGraduationCap className="text-blue-600" />}
      description="Create and manage skills for assessments"
      notifications={notifications}
      onCloseNotification={removeNotification}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Skills Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create, edit, and organize skills that can be used in assessments. Skills are grouped by categories
            and can be tagged for easier searching.
          </p>
        </div>

        <SkillManagement
          onSkillCreated={handleSkillCreated}
          onSkillUpdated={handleSkillUpdated}
          onSkillDeleted={handleSkillDeleted}
        />
      </div>
    </DashboardLayout>
  );
};

export default SkillsPage; 