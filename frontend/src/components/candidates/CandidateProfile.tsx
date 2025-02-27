import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub, FaEdit, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-5
}

interface TestResult {
  id: string;
  assessmentTitle: string;
  date: string;
  score: number;
  passingScore: number;
  status: 'passed' | 'failed';
  completionTime: number; // in minutes
}

interface CandidateProfileProps {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    linkedIn?: string;
    github?: string;
    avatar?: string;
    skills: Skill[];
    testResults: TestResult[];
    education?: Array<{
      institution: string;
      degree: string;
      field: string;
      startYear: number;
      endYear?: number;
    }>;
    experience?: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      description?: string;
    }>;
  };
  isEditable?: boolean;
  onEdit?: (section: string) => void;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({
  candidate,
  isEditable = false,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'skills'>('overview');

  const renderStarRating = (level: number) => {
    const stars = [];
    const fullStars = Math.floor(level);
    const hasHalfStar = level % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning-500" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-soft overflow-hidden">
      {/* Header */}
      <div className="bg-primary-600 h-32 relative">
        {candidate.avatar ? (
          <img
            src={candidate.avatar}
            alt={`${candidate.firstName} ${candidate.lastName}`}
            className="absolute bottom-0 left-8 transform translate-y-1/2 w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        ) : (
          <div className="absolute bottom-0 left-8 transform translate-y-1/2 w-24 h-24 rounded-full border-4 border-white bg-primary-200 flex items-center justify-center">
            <FaUser className="text-primary-600 text-4xl" />
          </div>
        )}
      </div>
      
      {/* Profile Info */}
      <div className="pt-16 px-8 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <div className="flex items-center text-gray-600 mt-1">
              <FaEnvelope className="mr-2" />
              <a href={`mailto:${candidate.email}`} className="hover:text-primary-600">
                {candidate.email}
              </a>
            </div>
            {candidate.phone && (
              <div className="flex items-center text-gray-600 mt-1">
                <FaPhone className="mr-2" />
                <span>{candidate.phone}</span>
              </div>
            )}
            {candidate.location && (
              <div className="flex items-center text-gray-600 mt-1">
                <FaMapMarkerAlt className="mr-2" />
                <span>{candidate.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {candidate.linkedIn && (
              <a
                href={candidate.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full"
              >
                <FaLinkedin className="text-xl" />
              </a>
            )}
            {candidate.github && (
              <a
                href={candidate.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full"
              >
                <FaGithub className="text-xl" />
              </a>
            )}
            {isEditable && onEdit && (
              <button
                onClick={() => onEdit('profile')}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full"
              >
                <FaEdit className="text-xl" />
              </button>
            )}
          </div>
        </div>
        
        {candidate.bio && (
          <div className="mt-4">
            <p className="text-gray-700">{candidate.bio}</p>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-t border-gray-200">
        <div className="flex">
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
              activeTab === 'overview'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
              activeTab === 'skills'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
              activeTab === 'tests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('tests')}
          >
            Test History
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Education Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Education</h2>
                {isEditable && onEdit && (
                  <button
                    onClick={() => onEdit('education')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
              
              {candidate.education && candidate.education.length > 0 ? (
                <div className="space-y-4">
                  {candidate.education.map((edu, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                      <h3 className="font-medium text-gray-800">{edu.institution}</h3>
                      <p className="text-gray-600">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No education information provided.</p>
              )}
            </div>
            
            {/* Experience Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Experience</h2>
                {isEditable && onEdit && (
                  <button
                    onClick={() => onEdit('experience')}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
              
              {candidate.experience && candidate.experience.length > 0 ? (
                <div className="space-y-4">
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4 py-1">
                      <h3 className="font-medium text-gray-800">{exp.position}</h3>
                      <p className="text-gray-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-gray-700">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No experience information provided.</p>
              )}
            </div>
          </div>
        )}
        
        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
              {isEditable && onEdit && (
                <button
                  onClick={() => onEdit('skills')}
                  className="text-primary-600 hover:text-primary-700"
                >
                  <FaEdit />
                </button>
              )}
            </div>
            
            {candidate.skills.length > 0 ? (
              <div>
                {/* Group skills by category */}
                {Object.entries(
                  candidate.skills.reduce((acc, skill) => {
                    if (!acc[skill.category]) {
                      acc[skill.category] = [];
                    }
                    acc[skill.category].push(skill);
                    return acc;
                  }, {} as Record<string, Skill[]>)
                ).map(([category, skills]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-3">{category}</h3>
                    <div className="space-y-3">
                      {skills.map((skill) => (
                        <div key={skill.id} className="flex justify-between items-center">
                          <span className="text-gray-800">{skill.name}</span>
                          {renderStarRating(skill.level)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills information provided.</p>
            )}
          </div>
        )}
        
        {/* Test History Tab */}
        {activeTab === 'tests' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test History</h2>
            
            {candidate.testResults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assessment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidate.testResults.map((result) => (
                      <tr key={result.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{result.assessmentTitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{result.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {result.score}% <span className="text-xs text-gray-500">({result.passingScore}% to pass)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.status === 'passed'
                              ? 'bg-success-100 text-success-800'
                              : 'bg-danger-100 text-danger-800'
                          }`}>
                            {result.status === 'passed' ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.completionTime} min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No test history available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile; 