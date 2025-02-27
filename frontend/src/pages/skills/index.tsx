import React from 'react';
import { NextPage } from 'next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SkillManagement from '../../components/skills/SkillManagement';
import { Skill } from '../../services/skillsService';
import { FaGraduationCap } from 'react-icons/fa';

const SkillsPage: NextPage = () => {
  // Handlers for skill events
  const handleSkillCreated = (skill: Skill) => {
    console.log('Skill created:', skill);
    // You could show a notification here
  };

  const handleSkillUpdated = (skill: Skill) => {
    console.log('Skill updated:', skill);
    // You could show a notification here
  };

  const handleSkillDeleted = (id: string) => {
    console.log('Skill deleted:', id);
    // You could show a notification here
  };

  return (
    <DashboardLayout
      title="Skills Management"
      icon={<FaGraduationCap className="text-primary-500" />}
      description="Create and manage skills for assessments"
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