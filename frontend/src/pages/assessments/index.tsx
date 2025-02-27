import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

export default function AssessmentsPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real app, these would be API calls
      // const assessmentsResponse = await fetch('/api/v1/assessments');
      // const assessmentsData = await assessmentsResponse.json();
      // setAssessments(assessmentsData);
      
      // const skillsResponse = await fetch('/api/v1/skills');
      // const skillsData = await skillsResponse.json();
      // setSkills(skillsData);
      
      // Mock data for now
      setAssessments([
        { 
          id: '1', 
          title: 'Full Stack Developer Assessment', 
          description: 'Comprehensive assessment for full stack developers',
          skillIds: ['1', '2', '3'],
          timeLimit: 120,
          passingScore: 70,
          createdAt: '2025-02-20T10:00:00Z',
          status: 'active'
        },
        { 
          id: '2', 
          title: 'Frontend Developer Assessment', 
          description: 'Assessment focused on React, CSS and JavaScript',
          skillIds: ['1', '4'],
          timeLimit: 90,
          passingScore: 75,
          createdAt: '2025-02-22T14:30:00Z',
          status: 'active'
        },
        { 
          id: '3', 
          title: 'Backend Developer Assessment', 
          description: 'Assessment for backend skills including databases and APIs',
          skillIds: ['2', '5'],
          timeLimit: 90,
          passingScore: 80,
          createdAt: '2025-02-25T09:15:00Z',
          status: 'draft'
        }
      ]);
      
      setSkills([
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'Python' },
        { id: '3', name: 'SQL' },
        { id: '4', name: 'React' },
        { id: '5', name: 'Django' }
      ]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleSkillFilterChange = (e) => {
    setSelectedSkill(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateAssessment = () => {
    router.push('/assessments/create');
  };

  const handleViewAssessment = (id) => {
    router.push(`/assessments/${id}`);
  };

  const handleEditAssessment = (id) => {
    router.push(`/assessments/${id}/edit`);
  };

  const handleDeleteAssessment = (id) => {
    setAssessmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch(`/api/v1/assessments/${assessmentToDelete}`, {
      //   method: 'DELETE'
      // });
      
      // For now, just filter out the deleted assessment
      setAssessments(assessments.filter(assessment => assessment.id !== assessmentToDelete));
      setShowDeleteConfirm(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error('Error deleting assessment:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAssessmentToDelete(null);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSkill = selectedSkill ? assessment.skillIds.includes(selectedSkill) : true;
    
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Assessments</h1>
          <button
            onClick={handleCreateAssessment}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Create Assessment
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <select
                value={selectedSkill}
                onChange={handleSkillFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
                {skills.map(skill => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No assessments found. Create your first assessment!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map(assessment => (
                <div key={assessment.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">{assessment.title}</h2>
                      <div className="relative">
                        <div className="dropdown inline-block relative">
                          <button className="p-1 rounded-full hover:bg-gray-100">
                            <FaEllipsisV className="text-gray-500" />
                          </button>
                          <div className="dropdown-menu absolute right-0 hidden bg-white mt-1 py-2 w-48 rounded-md shadow-lg z-10">
                            <button 
                              onClick={() => handleViewAssessment(assessment.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <FaEye className="mr-2" /> View
                            </button>
                            <button 
                              onClick={() => handleEditAssessment(assessment.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                            >
                              <FaTrash className="mr-2" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{assessment.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {assessment.skillIds.map(skillId => {
                        const skill = skills.find(s => s.id === skillId);
                        return skill ? (
                          <span key={skillId} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {skill.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-500">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          assessment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assessment.status === 'active' ? 'Active' : 'Draft'}
                        </span>
                      </div>
                      <div>
                        {assessment.timeLimit} min | {assessment.passingScore}% pass
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-5 py-3 text-right">
                    <button
                      onClick={() => handleViewAssessment(assessment.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this assessment? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 