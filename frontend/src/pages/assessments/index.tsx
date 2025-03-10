import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash, FaEye, FaSpinner, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import DashboardLayout from '../../components/layout/DashboardLayout';
import assessmentsService, { Assessment } from '../../services/assessmentsService';
import skillsService, { Skill } from '../../services/skillsService';
import { formatDate } from '../../utils/dateUtils';

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assessments
      try {
        const assessmentsData = await assessmentsService.getAssessments();
        console.log('Fetched assessments:', assessmentsData);
        setAssessments(Array.isArray(assessmentsData) ? assessmentsData : []);
      } catch (assessmentError) {
        console.error('Error fetching assessments:', assessmentError);
        setError('Failed to load assessments. Please try again later.');
        setAssessments([]);
      }
      
      // Fetch skills
      try {
        const skillsData = await skillsService.getSkills();
        console.log('Fetched skills:', skillsData);
        setSkills(Array.isArray(skillsData) ? skillsData : []);
      } catch (skillError) {
        console.error('Error fetching skills:', skillError);
        // Don't set error if only skills failed but assessments succeeded
        if (!error) {
          setError('Failed to load skills. Some filtering options may not be available.');
        }
        setSkills([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('An unexpected error occurred. Please try again later.');
      setLoading(false);
    }
  };

  const handleSkillFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSkill(e.target.value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateAssessment = () => {
    router.push('/assessments/create');
  };

  const handleViewAssessment = (id: string) => {
    router.push(`/assessments/${id}`);
  };

  const handleEditAssessment = (id: string) => {
    router.push(`/assessments/${id}/edit`);
  };

  const handleDeleteAssessment = (id: string) => {
    setAssessmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!assessmentToDelete) return;
    
    setDeleteLoading(true);
    try {
      await assessmentsService.deleteAssessment(assessmentToDelete);
      
      // Remove the deleted assessment from the state
      setAssessments(assessments.filter(assessment => assessment.id !== assessmentToDelete));
      
      // Close the confirmation dialog
      setShowDeleteConfirm(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error('Error deleting assessment:', error);
      setError('Failed to delete assessment. Please try again later.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAssessmentToDelete(null);
  };

  // Filter assessments based on search term and selected skill
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = !selectedSkill || 
      (assessment.skills && assessment.skills.some(skill => skill.id === selectedSkill));
    
    return matchesSearch && matchesSkill;
  });

  // Get skill names for an assessment
  const getSkillNames = (assessment: Assessment) => {
    if (!assessment.skills || !assessment.skills.length) return 'No skills';
    
    return assessment.skills.map(skill => skill.name).join(', ');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <button
            onClick={handleCreateAssessment}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Assessment
          </button>
        </div>
        
        {/* Filters */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search assessments..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={selectedSkill}
                onChange={handleSkillFilterChange}
              >
                <option value="">All Skills</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={fetchData}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center h-64">
            <div className="text-center">
              <FaSpinner className="animate-spin h-8 w-8 text-primary-500 mx-auto" />
              <p className="mt-4 text-gray-600">Loading assessments...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Assessments list */}
            {filteredAssessments.length > 0 ? (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assessment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Limit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passing Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssessments.map(assessment => (
                      <tr key={assessment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                              <div className="text-sm text-gray-500">{assessment.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getSkillNames(assessment)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{assessment.time_limit} minutes</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{assessment.passing_score}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(assessment.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            assessment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assessment.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewAssessment(assessment.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Assessment"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleEditAssessment(assessment.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Assessment"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Assessment"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-4">No assessments found.</p>
                <button
                  onClick={handleCreateAssessment}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 inline-flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Create your first assessment
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this assessment? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 