import React, { useState } from 'react';
import { FaEnvelope, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';

// Add import for candidateService
import candidateService, { CandidateInvite } from '../../services/candidateService';

interface InviteCandidateProps {
  assessmentId?: string;
  onSuccess?: () => void;
}

const InviteCandidate: React.FC<InviteCandidateProps> = ({ assessmentId, onSuccess }) => {
  const [candidates, setCandidates] = useState<{ email: string; name: string }[]>([
    { email: '', name: '' }
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<{ id: string; title: string }[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(assessmentId || '');

  // Fetch available assessments when component mounts
  React.useEffect(() => {
    const fetchAssessments = async () => {
      try {
        // In a real app, this would be an API call
        // Mock data for now
        const mockAssessments = [
          { id: '1', title: 'JavaScript Fundamentals' },
          { id: '2', title: 'React Component Development' },
          { id: '3', title: 'CSS and Responsive Design' },
          { id: '4', title: 'Data Structures and Algorithms' }
        ];
        setAssessments(mockAssessments);
        
        if (assessmentId && !selectedAssessmentId) {
          setSelectedAssessmentId(assessmentId);
        } else if (mockAssessments.length > 0 && !selectedAssessmentId) {
          setSelectedAssessmentId(mockAssessments[0].id);
        }
      } catch (err) {
        setError('Failed to load assessments');
      }
    };
    
    fetchAssessments();
  }, [assessmentId, selectedAssessmentId]);

  const handleAddCandidate = () => {
    setCandidates([...candidates, { email: '', name: '' }]);
  };

  const handleRemoveCandidate = (index: number) => {
    if (candidates.length > 1) {
      const newCandidates = [...candidates];
      newCandidates.splice(index, 1);
      setCandidates(newCandidates);
    }
  };

  const handleCandidateChange = (index: number, field: 'name' | 'email', value: string) => {
    const newCandidates = [...candidates];
    newCandidates[index][field] = value;
    setCandidates(newCandidates);
  };

  const validateEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return candidates.every(candidate => 
      candidate.email.trim() !== '' && 
      emailRegex.test(candidate.email) &&
      candidate.name.trim() !== ''
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateEmails()) {
      setError('Please provide valid name and email for all candidates');
      return;
    }
    
    if (!selectedAssessmentId) {
      setError('Please select an assessment');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the candidateService to send invitations
      const response = await candidateService.inviteCandidates({
        assessment_id: selectedAssessmentId,
        candidates: candidates as CandidateInvite[],
        message: message || undefined
      });
      
      setSuccess(`Successfully sent invitations to ${response.success_count} candidate(s)`);
      
      // If there were any failures, show them in the error message
      if (response.failed_count > 0) {
        const failedEmails = response.failed.map(f => f.email).join(', ');
        setError(`Failed to invite: ${failedEmails}`);
      }
      
      // Reset the form
      setCandidates([{ email: '', name: '' }]);
      setMessage('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Invite Candidates</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="assessment" className="block text-sm font-medium text-gray-700 mb-1">
            Select Assessment
          </label>
          <select
            id="assessment"
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            required
          >
            <option value="">Select an assessment</option>
            {assessments.map(assessment => (
              <option key={assessment.id} value={assessment.id}>
                {assessment.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Candidates
          </label>
          
          <div className="space-y-3">
            {candidates.map((candidate, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={candidate.name}
                    onChange={(e) => handleCandidateChange(index, 'name', e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={candidate.email}
                    onChange={(e) => handleCandidateChange(index, 'email', e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCandidate(index)}
                    disabled={candidates.length === 1}
                    className={`inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                      candidates.length === 1
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3">
            <button
              type="button"
              onClick={handleAddCandidate}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2 -ml-0.5 h-4 w-4" />
              Add Another Candidate
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Message (Optional)
          </label>
          <textarea
            id="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Add a personal message to the invitation email..."
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2 -ml-1 h-4 w-4" />
                Sending Invitations...
              </>
            ) : (
              <>
                <FaEnvelope className="mr-2 -ml-1 h-4 w-4" />
                Send Invitations
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700">What happens next?</h3>
        <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
          <li>Candidates will receive an email invitation with a unique access code</li>
          <li>They can use their email and the access code to log in and take the assessment</li>
          <li>You'll be notified when candidates complete their assessments</li>
          <li>Results will be available in the candidate profiles section</li>
        </ul>
      </div>
    </div>
  );
};

export default InviteCandidate; 