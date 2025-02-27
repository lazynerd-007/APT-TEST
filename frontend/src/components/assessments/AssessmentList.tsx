import React, { useState } from 'react';
import { 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaEllipsisV, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaCopy, 
  FaUsers, 
  FaChartBar,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

interface Assessment {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'archived';
  duration: number; // in minutes
  passingScore: number;
  questionCount: number;
  candidateCount: number;
  completionRate: number;
  averageScore: number;
  skills: Array<{
    id: string;
    name: string;
  }>;
}

interface AssessmentListProps {
  assessments: Assessment[];
  onCreateAssessment: () => void;
  onViewAssessment: (id: string) => void;
  onEditAssessment: (id: string) => void;
  onDeleteAssessment: (id: string) => void;
  onDuplicateAssessment: (id: string) => void;
  onViewCandidates: (id: string) => void;
  onViewAnalytics: (id: string) => void;
}

const AssessmentList: React.FC<AssessmentListProps> = ({
  assessments,
  onCreateAssessment,
  onViewAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onDuplicateAssessment,
  onViewCandidates,
  onViewAnalytics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Assessment['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt' | 'candidateCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const toggleActionMenu = (id: string) => {
    setActionMenuOpen(actionMenuOpen === id ? null : id);
  };

  const closeActionMenu = () => {
    setActionMenuOpen(null);
  };

  const filteredAssessments = assessments
    .filter(assessment => {
      // Filter by search term
      const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected field
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'candidateCount':
          comparison = a.candidateCount - b.candidateCount;
          break;
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getStatusBadgeClass = (status: Assessment['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden">
      {/* Header and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Assessments</h1>
          <button
            onClick={onCreateAssessment}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Create Assessment
          </button>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          {/* Sort */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSort className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="title">Title</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
              <option value="candidateCount">Candidate Count</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={toggleSortOrder}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FaSort className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assessment List */}
      <div className="overflow-x-auto">
        {filteredAssessments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assessment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAssessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{assessment.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{assessment.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        <span>Created: {assessment.createdAt}</span>
                      </div>
                      <div className="flex items-center mb-1">
                        <FaClock className="mr-2 text-gray-400" />
                        <span>{assessment.duration} min</span>
                      </div>
                      <div className="flex items-center">
                        <FaCheckCircle className="mr-2 text-gray-400" />
                        <span>Pass: {assessment.passingScore}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(assessment.status)}`}>
                      {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaUsers className="mr-2 text-gray-400" />
                      <span>{assessment.candidateCount} candidates</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <span className="mr-2">Completion:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-primary-600 h-2.5 rounded-full"
                            style={{ width: `${assessment.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{assessment.completionRate}%</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">Avg Score:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              assessment.averageScore >= assessment.passingScore
                                ? 'bg-success-500'
                                : 'bg-danger-500'
                            }`}
                            style={{ width: `${assessment.averageScore}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{assessment.averageScore}%</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <button
                      onClick={() => toggleActionMenu(assessment.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <FaEllipsisV />
                    </button>
                    
                    {actionMenuOpen === assessment.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={closeActionMenu}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button
                              onClick={() => {
                                onViewAssessment(assessment.id);
                                closeActionMenu();
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              <FaEye className="mr-3 text-gray-400" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                onEditAssessment(assessment.id);
                                closeActionMenu();
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              <FaEdit className="mr-3 text-gray-400" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                onDuplicateAssessment(assessment.id);
                                closeActionMenu();
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              <FaCopy className="mr-3 text-gray-400" />
                              Duplicate
                            </button>
                            <button
                              onClick={() => {
                                onViewCandidates(assessment.id);
                                closeActionMenu();
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              <FaUsers className="mr-3 text-gray-400" />
                              View Candidates
                            </button>
                            <button
                              onClick={() => {
                                onViewAnalytics(assessment.id);
                                closeActionMenu();
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              <FaChartBar className="mr-3 text-gray-400" />
                              Analytics
                            </button>
                            <button
                              onClick={() => {
                                onDeleteAssessment(assessment.id);
                                closeActionMenu();
                              }}
                              className="flex items-center px-4 py-2 text-sm text-danger-600 hover:bg-gray-100 w-full text-left"
                              role="menuitem"
                            >
                              <FaTrash className="mr-3 text-danger-500" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No assessments found matching your criteria.</p>
            <button
              onClick={onCreateAssessment}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create your first assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentList; 