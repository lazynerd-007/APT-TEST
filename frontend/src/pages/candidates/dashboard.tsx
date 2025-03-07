import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FaClipboardList, FaCheckCircle, FaClock, FaExclamationCircle, FaPlay } from 'react-icons/fa';

interface Assessment {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
}

const CandidateDashboard = () => {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  useEffect(() => {
    // In a real app, fetch assessments from API
    // For now, use mock data
    const fetchAssessments = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAssessments([
          {
            id: '1',
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
            timeLimit: 60,
            dueDate: '2025-03-15T23:59:59Z',
            status: 'pending'
          },
          {
            id: '2',
            title: 'React Component Development',
            description: 'Demonstrate your ability to build React components and manage state.',
            timeLimit: 90,
            dueDate: '2025-03-20T23:59:59Z',
            status: 'pending'
          },
          {
            id: '3',
            title: 'CSS and Responsive Design',
            description: 'Show your skills in creating responsive layouts and styling web applications.',
            timeLimit: 45,
            dueDate: '2025-03-10T23:59:59Z',
            status: 'completed',
            score: 85
          },
          {
            id: '4',
            title: 'Data Structures and Algorithms',
            description: 'Solve problems using common data structures and algorithms.',
            timeLimit: 120,
            dueDate: '2025-03-05T23:59:59Z',
            status: 'completed',
            score: 92
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assessments:', error);
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    }
    
    if (diffDays === 0) {
      return 'Due today';
    }
    
    if (diffDays === 1) {
      return '1 day remaining';
    }
    
    return `${diffDays} days remaining`;
  };

  const getStatusColor = (status: Assessment['status'], dueDate: string) => {
    if (status === 'completed') {
      return 'text-green-600';
    }
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'text-red-600';
    }
    
    if (diffDays <= 2) {
      return 'text-yellow-600';
    }
    
    return 'text-blue-600';
  };

  const getStatusIcon = (status: Assessment['status'], dueDate: string) => {
    if (status === 'completed') {
      return <FaCheckCircle className="text-green-600" />;
    }
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <FaExclamationCircle className="text-red-600" />;
    }
    
    if (diffDays <= 2) {
      return <FaClock className="text-yellow-600" />;
    }
    
    return <FaClock className="text-blue-600" />;
  };

  const filteredAssessments = assessments.filter(assessment => {
    if (activeTab === 'pending') {
      return assessment.status !== 'completed';
    }
    return assessment.status === 'completed';
  });

  const handleStartAssessment = (assessmentId: string) => {
    router.push(`/assessments/take?id=${assessmentId}`);
  };

  return (
    <DashboardLayout
      title="My Assessments"
      icon={<FaClipboardList className="text-blue-600" />}
      description="View and take your assigned assessments"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending Assessments
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Completed Assessments
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <p className="text-gray-500">
              {activeTab === 'pending'
                ? 'You have no pending assessments.'
                : 'You have not completed any assessments yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAssessments.map(assessment => (
              <div key={assessment.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{assessment.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{assessment.description}</p>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(assessment.status, assessment.dueDate)}
                      <span className={`ml-2 text-sm ${getStatusColor(assessment.status, assessment.dueDate)}`}>
                        {assessment.status === 'completed'
                          ? 'Completed'
                          : getDaysRemaining(assessment.dueDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      <span>Time Limit: {formatTimeLimit(assessment.timeLimit)}</span>
                    </div>
                    <div>
                      <span>Due: {formatDate(assessment.dueDate)}</span>
                    </div>
                    {assessment.status === 'completed' && assessment.score !== undefined && (
                      <div className="flex items-center">
                        <FaCheckCircle className={`mr-1 ${assessment.score >= 70 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className={assessment.score >= 70 ? 'text-green-600' : 'text-red-600'}>
                          Score: {assessment.score}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {assessment.status !== 'completed' && (
                    <div className="mt-6">
                      <button
                        onClick={() => handleStartAssessment(assessment.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FaPlay className="mr-2 -ml-1 h-4 w-4" />
                        Start Assessment
                      </button>
                    </div>
                  )}
                  
                  {assessment.status === 'completed' && (
                    <div className="mt-6">
                      <Link href={`/assessments/results?id=${assessment.id}`} passHref>
                        <a className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          View Results
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateDashboard; 