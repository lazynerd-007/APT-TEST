import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FaUsers, FaSearch } from 'react-icons/fa';

interface Candidate {
  id: string;
  name: string;
  email: string;
  assessmentsTaken: number;
  averageScore: number;
  lastActivity: string;
  status: 'active' | 'invited' | 'completed';
}

const CandidatesPage = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, fetch candidates from API
    // For now, use mock data
    const fetchCandidates = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCandidates([
          {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            assessmentsTaken: 3,
            averageScore: 85,
            lastActivity: '2025-02-25T14:30:00Z',
            status: 'completed'
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            assessmentsTaken: 2,
            averageScore: 92,
            lastActivity: '2025-02-24T10:15:00Z',
            status: 'completed'
          },
          {
            id: '3',
            name: 'Michael Johnson',
            email: 'michael.johnson@example.com',
            assessmentsTaken: 1,
            averageScore: 78,
            lastActivity: '2025-02-23T16:45:00Z',
            status: 'completed'
          },
          {
            id: '4',
            name: 'Emily Williams',
            email: 'emily.williams@example.com',
            assessmentsTaken: 0,
            averageScore: 0,
            lastActivity: '2025-02-26T09:00:00Z',
            status: 'invited'
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout
      title="Candidates"
      icon={<FaUsers className="text-blue-600" />}
      description="View and manage candidates taking your assessments"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">All Candidates</h2>
            
            <div className="w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No candidates found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessments
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{candidate.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{candidate.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{candidate.assessmentsTaken}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">
                          {candidate.averageScore > 0 ? `${candidate.averageScore}%` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{formatDate(candidate.lastActivity)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          candidate.status === 'completed' ? 'bg-green-100 text-green-800' :
                          candidate.status === 'invited' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CandidatesPage; 