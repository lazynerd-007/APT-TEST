import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaClipboardList, FaCheckCircle, FaClock, FaExclamationCircle, FaPlay, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { assessmentsService } from '@/services/assessmentsService';
import { Spinner, Button, Badge } from '@/components/ui';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import authService from '../../services/authService';
import Link from 'next/link';

// Simple layout for candidate pages (same as in other candidate pages)
const CandidateLayout = ({ children, user }) => {
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.push('/candidate/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Assessment Platform - Dashboard</title>
      </Head>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Assessment Platform</h1>
          {user && (
            <div className="flex items-center">
              <div className="mr-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <FaUser className="mr-1" />
                  {user.first_name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <FaSignOutAlt className="mr-1" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};

const CandidateDashboard = () => {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/candidate/login');
      return;
    }
    
    setUser(currentUser);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // In a real application, you would fetch the candidate's assessments
      // For now, we'll use mock data
      
      // Mock assessments data
      const mockAssessments = [
        {
          id: 'assessment-1',
          title: 'Frontend Developer Assessment',
          description: 'Comprehensive assessment for frontend developer position',
          status: 'in_progress',
          score: null,
          start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          end_time: null,
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: 'assessment-2',
          title: 'JavaScript Proficiency Test',
          description: 'Test your JavaScript knowledge and skills',
          status: 'completed',
          score: 85,
          start_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          end_time: new Date(Date.now() - 169200000).toISOString(), // 2 days ago + 1 hour
          created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
        {
          id: 'assessment-3',
          title: 'Backend Developer Assessment',
          description: 'Comprehensive assessment for backend developer position',
          status: 'not_started',
          score: null,
          start_time: null,
          end_time: null,
          created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        }
      ];
      
      // Mock tests data
      const mockTests = [
        {
          id: 'test-1',
          candidate_assessment: 'assessment-1',
          title: 'React Fundamentals',
          description: 'Test your knowledge of React fundamentals',
          status: 'in_progress',
          score: null,
          start_time: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          end_time: null,
          time_limit: 60, // 60 minutes
        },
        {
          id: 'test-2',
          candidate_assessment: 'assessment-1',
          title: 'CSS and HTML',
          description: 'Test your knowledge of CSS and HTML',
          status: 'not_started',
          score: null,
          start_time: null,
          end_time: null,
          time_limit: 45, // 45 minutes
        },
        {
          id: 'test-3',
          candidate_assessment: 'assessment-2',
          title: 'JavaScript Basics',
          description: 'Test your knowledge of JavaScript basics',
          status: 'completed',
          score: 90,
          start_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          end_time: new Date(Date.now() - 170100000).toISOString(), // 2 days ago + 45 minutes
          time_limit: 45, // 45 minutes
        },
        {
          id: 'test-4',
          candidate_assessment: 'assessment-2',
          title: 'JavaScript Advanced',
          description: 'Test your knowledge of advanced JavaScript concepts',
          status: 'completed',
          score: 80,
          start_time: new Date(Date.now() - 169200000).toISOString(), // 2 days ago + 1 hour
          end_time: new Date(Date.now() - 166500000).toISOString(), // 2 days ago + 1 hour + 45 minutes
          time_limit: 45, // 45 minutes
        },
        {
          id: 'test-5',
          candidate_assessment: 'assessment-3',
          title: 'Node.js Fundamentals',
          description: 'Test your knowledge of Node.js fundamentals',
          status: 'not_started',
          score: null,
          start_time: null,
          end_time: null,
          time_limit: 60, // 60 minutes
        },
        {
          id: 'test-6',
          candidate_assessment: 'assessment-3',
          title: 'Database Concepts',
          description: 'Test your knowledge of database concepts',
          status: 'not_started',
          score: null,
          start_time: null,
          end_time: null,
          time_limit: 45, // 45 minutes
        }
      ];
      
      setAssessments(mockAssessments);
      setTests(mockTests);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      expired: { label: 'Expired', color: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={`${statusInfo.color} capitalize`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTestsForAssessment = (assessmentId) => {
    return tests.filter(test => test.candidate_assessment === assessmentId);
  };

  const getAssessmentProgress = (assessmentId) => {
    const assessmentTests = getTestsForAssessment(assessmentId);
    if (assessmentTests.length === 0) return 0;
    
    const completedTests = assessmentTests.filter(test => test.status === 'completed').length;
    return Math.round((completedTests / assessmentTests.length) * 100);
  };

  const getAssessmentScore = (assessmentId) => {
    const assessmentTests = getTestsForAssessment(assessmentId);
    if (assessmentTests.length === 0) return 0;
    
    const completedTests = assessmentTests.filter(test => test.status === 'completed');
    if (completedTests.length === 0) return 0;
    
    const totalScore = completedTests.reduce((sum, test) => sum + (test.score || 0), 0);
    return Math.round(totalScore / completedTests.length);
  };

  if (loading) {
    return (
      <CandidateLayout user={user}>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout user={user}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Assessments</h2>
          {user && (
            <p className="text-gray-600 mt-1">
              Welcome back, {user.first_name}! Here are your assigned assessments.
            </p>
          )}
        </div>
        
        {assessments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-soft p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No assessments assigned</h3>
            <p className="text-gray-500 mb-4">
              You don't have any assessments assigned to you yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {assessments.map(assessment => {
              const assessmentTests = getTestsForAssessment(assessment.id);
              const progress = getAssessmentProgress(assessment.id);
              const score = getAssessmentScore(assessment.id);
              
              return (
                <div key={assessment.id} className="bg-white rounded-lg shadow-soft overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{assessment.title}</h3>
                        <p className="text-gray-600">{assessment.description}</p>
                      </div>
                      <div className="flex items-center">
                        {getStatusBadge(assessment.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Progress:</span>
                        <div className="mt-1 relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block text-primary-600">
                                {progress}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                            <div 
                              style={{ width: `${progress}%` }} 
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">Assigned:</span>
                        <p className="text-gray-900">{formatDate(assessment.created_at)}</p>
                      </div>
                      
                      {assessment.status === 'completed' && (
                        <div>
                          <span className="text-sm font-medium text-gray-500">Score:</span>
                          <p className="text-gray-900 font-semibold">{score}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200">
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-gray-800 mb-3">Tests</h4>
                      
                      <div className="space-y-4">
                        {assessmentTests.map(test => (
                          <div key={test.id} className="border border-gray-200 rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-800">{test.title}</h5>
                                <p className="text-sm text-gray-600">{test.description}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <FaClock className="mr-1" />
                                    <span>{test.time_limit} minutes</span>
                                  </div>
                                  <div className="flex items-center">
                                    {getStatusBadge(test.status)}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                {test.status === 'not_started' && (
                                  <Button
                                    onClick={() => router.push(`/candidate/tests/${test.id}`)}
                                    className="flex items-center"
                                  >
                                    <FaPlay className="mr-2" />
                                    Start Test
                                  </Button>
                                )}
                                
                                {test.status === 'in_progress' && (
                                  <Button
                                    onClick={() => router.push(`/candidate/tests/${test.id}`)}
                                    className="flex items-center"
                                    variant="warning"
                                  >
                                    <FaClock className="mr-2" />
                                    Continue
                                  </Button>
                                )}
                                
                                {test.status === 'completed' && (
                                  <Button
                                    onClick={() => router.push(`/candidate/results/${test.id}`)}
                                    className="flex items-center"
                                    variant="outline"
                                  >
                                    <FaCheckCircle className="mr-2 text-green-500" />
                                    View Results
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {test.status === 'completed' && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                  <div className="text-sm text-gray-500">
                                    Completed on {formatDate(test.end_time)}
                                  </div>
                                  <div className="font-medium text-gray-900">
                                    Score: {test.score}%
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CandidateLayout>
  );
};

export default CandidateDashboard; 