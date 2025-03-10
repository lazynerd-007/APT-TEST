import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';
import skillsService from '../../services/skillsService';
import assessmentsService from '../../services/assessmentsService';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [skillsCount, setSkillsCount] = useState<number>(0);
  const [assessmentsCount, setAssessmentsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch skills count
        const skills = await skillsService.getSkills();
        if (Array.isArray(skills)) {
          setSkillsCount(skills.length);
        }
        
        // Fetch assessments count
        const assessments = await assessmentsService.getAssessments();
        if (Array.isArray(assessments)) {
          setAssessmentsCount(assessments.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium text-gray-800">{user?.name} ({user?.role})</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-md flex items-center transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            Welcome to the BLUAPT platform dashboard. Manage your skills, assessments, and candidates from here.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Skills</h3>
              <p className="text-3xl font-bold text-blue-800">
                {loading ? "..." : skillsCount}
              </p>
              <p className="text-sm text-blue-600 mt-1">Active skills in the system</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Assessments</h3>
              <p className="text-3xl font-bold text-green-800">
                {loading ? "..." : assessmentsCount}
              </p>
              <p className="text-sm text-green-600 mt-1">Published assessments</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-700 mb-2">Candidates</h3>
              <p className="text-3xl font-bold text-purple-800">8</p>
              <p className="text-sm text-purple-600 mt-1">Candidates evaluated</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/skills" className="block p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
              <h3 className="text-lg font-semibold text-blue-700 mb-1">Manage Skills</h3>
              <p className="text-sm text-blue-600">Create and organize skills</p>
            </Link>
            
            <Link href="/assessments" className="block p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
              <h3 className="text-lg font-semibold text-green-700 mb-1">Manage Assessments</h3>
              <p className="text-sm text-green-600">Create and edit assessments</p>
            </Link>
            
            <Link href="/candidates" className="block p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
              <h3 className="text-lg font-semibold text-purple-700 mb-1">View Candidates</h3>
              <p className="text-sm text-purple-600">Review candidate results</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 